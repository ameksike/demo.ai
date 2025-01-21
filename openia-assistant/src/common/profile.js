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

    constructor() {
        this.name = "default";
        this.model = config.models["basic"];
        this.thread = [];
        this.stream = false;
        this.provider = "llama";
        this.inThread = true;
        this.defaults = null;
        this.training = null;
        this.roles = {
            "system": "system",
            "tool": "tool",
            "user": "user",
        };
    }

    async configure(payload = "default") {
        try {
            let name = typeof payload === "string" ? payload : payload.name;
            let meta = name && await srvConfig.load(name, "db");
            let data = { ...meta, ...(typeof payload === "object" && payload || {}) };

            this.name = name || this.name;
            this.provider = data.provider || this.provider;
            this.stream = data.stream ?? this.stream;
            this.thread = data.thread || this.thread;
            this.inThread = data.inThread ?? this.inThread;
            this.training = data.training || this.training;
            this.defaults = data.defaults || this.defaults;
            this.roles = { ...this.roles, ...data.roles };
            this.model = config.models[data.model] || this.model;
            this.modelKey = data.model;
            this.tasks = data.tools;
            this.tools = await this.getTools(data.tools);
        }
        catch (error) {
            console.log({ src: "Profile:Service:configure", error, data: payload });
        }
        return this;
    }

    asDto() {
        return {
            name: this.name,
            model: this.modelKey,
            tools: this.tasks,
            roles: this.roles,
            stream: this.stream,
            thread: this.thread,
            provider: this.provider,
            inThread: this.inThread,
            training: this.training,
            defaults: this.defaults,
        }
    }

    save() {
        return this.inThread && srvConfig.save(this.asDto(), this.name, "db");
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
     * @description Resolve the task list 
     * @param {Array<TConnector>} tools 
     * @returns {Array<TTask>}
     */
    async getTools(tools) {
        let tmp = await Promise.all(tools.map(async tool => {
            if (tool?.definition) {
                return tool?.definition;
            } else {
                let conn = tool?.name && await ioc.getConnector(tool.name);
                return conn?.definition
            }
        }))
        return (Array.isArray(tmp) && tmp.filter(v => !!v)) || [];
    }

    /**
     * @description Add content to the conversation thread, including training if needed.
     * @param {String|TMsg|Array<TMsg>} content 
     * @param {Object} [options] 
     * @param {String} [options.role] 
     * @param {Boolean} [options.inThread] 
     * @returns {Profile} self
     */
    process(content, options) {
        const { role = this.roles.system, inThread = this.inThread } = options || {};
        const thread = inThread ? this.thread : [];
        this.train({ ...options, thread });
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
        return this;
    }
}