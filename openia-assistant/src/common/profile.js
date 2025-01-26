import * as srvConfig from './config.js';
import ioc from './locator.js';
import config from "../../cfg/config.js";

/**
 * @typedef  {import('./types.js').TMsg} TMsg
 * @typedef  {import('./types.js').TTask} TTask
 * @typedef  {import('./types.js').TResponse} TResponse 
 * @typedef  {import('./types.js').TConnector} TConnector 
 */

export class Profile {

    constructor(options = null) {
        const { logger = console } = options || {};
        this.logger = logger;
        this.name = "default";
        this.model = config.models["basic"];
        this.thread = [];
        this.stream = false;
        this.provider = "llama";
        this.providerUrl = "";
        this.persist = true;
        this.defaults = null;
        this.training = null;
        this.compatible = false;
        this.roles = {
            "system": "system",
            "tool": "tool",
            "user": "user",
        };
    }

    async configure(payload = "default") {
        try {
            this.name = (typeof payload === "string" ? payload : payload.name) || this.name;

            let meta = await this.load();
            let data = { ...meta, ...(typeof payload === "object" && payload || {}) };

            this.providerUrl = data.providerUrl || this.providerUrl;
            this.provider = data.provider || this.provider;
            this.stream = data.stream ?? this.stream;
            this.thread = data.thread || this.thread;
            this.persist = data.persist ?? this.persist;
            this.compatible = data.compatible ?? this.compatible;
            this.training = data.training || this.training;
            this.defaults = data.defaults || this.defaults;
            this.roles = { ...this.roles, ...data.roles };
            this.model = config.models[data.model] || this.model;
            this.modelKey = data.model;
            this.connectors = data.connectors;
            this.tools = await this.getTools(this.connectors);
        }
        catch (error) {
            this.logger?.log({ src: "Profile:configure", error, data: payload });
        }
        return this;
    }

    asDto() {
        return {
            name: this.name,
            model: this.modelKey,
            provider: this.provider,
            providerUrl: this.providerUrl,
            connectors: this.connectors,
            compatible: this.compatible,
            stream: this.stream,
            roles: this.roles,
            thread: this.thread,
            persist: this.persist,
            training: this.training,
            defaults: this.defaults,
        }
    }

    async load() {
        return this.name && await srvConfig.load(this.name + "/profile", "db");
    }

    save() {
        return srvConfig.save(this.asDto(), this.name + "/profile", "db");
    }

    train(options = null) {
        const { training = this?.training, thread = this.thread, roles = this.roles } = options || {};
        if ((!training?.name && !training?.instructions) || !Array.isArray(thread)) {
            return this;
        }
        thread.length === 0 && thread.push({
            "role": roles?.system,
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
            if (!connector?.definition) {
                throw new Error("No definition found in Connector: " + tool.name);
            }
            // Supports multiple action definitions
            let defTools = Array.isArray(connector?.definition) ? connector?.definition : [connector?.definition];
            for (let defTool of defTools) {
                // Validate tool definition and permissions 
                if (!defTool?.function?.name || (tool?.allows?.length && !tool?.allows.includes(defTool.function.name))) {
                    continue;
                }
                // Add profile tool name as prefix 
                defTool.function.name = tool.name + "_" + defTool?.function?.name;
                // Add custom context from profile tool
                tool?.description && (defTool.function.description += " " + tool?.description);
                // Include the function tool in the list
                list.push(defTool);
            }
        }
        catch (error) {
            this.logger?.error({ src: "Profile:gatherTool", error, data: tool });
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
        const { role = this.roles.system, persist = this.persist } = options || {};
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