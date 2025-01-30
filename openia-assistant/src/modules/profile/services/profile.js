import * as srvConfig from '../../../common/utils/config.js';
import ioc from '../../../common/utils/locator.js';

/**
 * @typedef  {import('../../../common/types.js').TMsg} TMsg
 * @typedef  {import('../../../common/types.js').TTask} TTask
 * @typedef  {import('../../../common/types.js').TResponse} TResponse 
 * @typedef  {import('../../../common/types.js').TConnector} TConnector 
 */

export class Profile {

    constructor(options = null) {
        const { logger = console } = options || {};
        this.logger = logger;
        this.name = "default";
        this.model = "";
        this.thread = [];
        this.stream = false;
        this.provider = "llama";
        this.providerUrl = "";
        this.persist = true;
        this.defaults = null;
        this.training = null;
        this.compatible = false;
    }

    async configure(payload = "default") {
        try {
            this.name = (typeof payload === "string" ? payload : payload.name) || this.name;

            let meta = await this.load();
            let data = { ...meta, ...(typeof payload === "object" && payload || {}) };

            this.providerUrl = data.providerUrl || this.providerUrl;
            this.provider = data.provider || this.provider;
            this.stream = data.stream ?? this.stream;
            this.persist = data.persist ?? this.persist;
            this.compatible = data.compatible ?? this.compatible;
            this.training = data.training || this.training;
            this.defaults = data.defaults || this.defaults;
            this.model = data.model;
            this.connectors = data.connectors;
            this.tools = await this.getTools(this.connectors);
            this.userId = payload?.userId;
            this.thread = await this.loadThread(this.userId) || [];
        }
        catch (error) {
            this.logger?.log({ src: "Service:Profile:configure", error, data: payload });
        }
        return this;
    }

    asDto() {
        return {
            name: this.name,
            model: this.model,
            provider: this.provider,
            providerUrl: this.providerUrl,
            connectors: this.connectors,
            compatible: this.compatible,
            stream: this.stream,
            persist: this.persist,
            training: this.training,
            defaults: this.defaults,
        }
    }

    async load() {
        return this.name && await srvConfig.load(this.name + "/profile", "db");
    }

    async loadThread(userId) {
        return this.name && await srvConfig.load(this.name + "/" + userId + "/thread", "db");
    }

    saveThread(userId) {
        return srvConfig.save(this.thread, this.name + "/" + userId + "/thread", "db");
    }

    save() {
        this.saveThread(this.userId);
        return srvConfig.save(this.asDto(), this.name + "/profile", "db");
    }

    train(options = null) {
        const { training = this?.training, thread = this.thread, role = "system" } = options || {};
        if ((!training?.name && !training?.instructions) || !Array.isArray(thread)) {
            return this;
        }
        thread.length === 0 && thread.push({
            "role": role,
            "content": `
                You are an AI assistant named "${training.name}". 
                Your primary role is defined as follows:
                    ${training.instructions}
                Always respond clearly and concisely, adapting your tone to the context. 
                Ensure accuracy and provide step-by-step explanations when appropriate. 
                Stay within your defined scope and handle requests with professionalism and precision.
            `
        });
        return this;
    }


    /**
     * @description Preprocess a tool and sit it in the list
     * @param {TConnector} tool 
     * @param {Array<TTask>} list 
     */
    async gatherTool(tool, list) {
        try {
            // Validate tool
            if (!tool?.name) {
                throw new Error("Invalid tool format");
            }
            // Custom tools do not require preprocess
            if (tool?.definition) {
                list.push(tool?.definition);
                return;
            }
            // Get definition from Connector 
            let connector = await ioc.getConnector(tool.name);
            let metadata = await connector.metadata;
            if (!metadata?.tools) {
                throw new Error("No definition found in Connector: " + tool.name);
            }
            // Supports multiple action definitions
            let defTools = Array.isArray(metadata?.tools) ? metadata?.tools : [metadata?.tools];
            for (let defTool of defTools) {
                // Validate tool definition and permissions 
                if (!defTool?.function?.name || (tool?.allows?.length && !tool?.allows.includes(defTool.function.name))) {
                    continue;
                }
                // Include the function tool in the list
                list.push({
                    type: defTool?.type,
                    function: {
                        ...defTool.function,
                        // Add profile tool name as prefix 
                        name: tool.name + "_" + (defTool?.function?.name || "run"),
                        // Add custom context from profile tool
                        description: (defTool.function.description || "") + " " + (tool?.description || "")
                    }
                });
            }
        }
        catch (error) {
            this.logger?.error({ src: "Service:Profile:gatherTool", error, data: tool });
        }
    }

    /**
     * @description Resolve the task list 
     * @param {Array<TConnector>} tools 
     * @returns {Array<TTask>}
     */
    async getTools(tools) {
        if (!tools?.length) {
            return [];
        }
        const list = [];
        await Promise.all(tools.map(tool => this.gatherTool(tool, list)));
        return list;
    }

    /**
     * @description Add content to the conversation thread, including training if needed.
     * @param {String|TMsg|Array<TMsg>} content 
     * @param {Object} [options] 
     * @param {String} [options.role] 
     * @param {Boolean} [options.persist] 
     * @returns {Profile} self
     */
    process(content, options) {
        const { role = "system", persist = this.persist } = options || {};
        const thread = persist ? this.thread : [];
        persist && this.train({ ...options, thread });
        if (!content) {
            return thread;
        }
        content = Array.isArray(content) ? content : [content];
        for (let item of content) {
            thread.push(
                typeof item === "string"
                    ? { role, content: item }
                    : { role, ...item }
            );
        }
        return thread;
    }
}