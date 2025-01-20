import * as locator from '../utils/locator.js';

/**
 * @typedef  {import('../models/types.js').TMsg} TMsg
 * @typedef  {import('../models/types.js').TTask} TTask
 * @typedef  {import('../models/types.js').TResponse} TResponse 
 * @typedef  {import('../models/types.js').TTraining} TTraining 
 * @typedef  {import('../models/types.js').TAiPayload} TAiPayload 
 */

export class ProviderAI {

    /**
     * @type {typeof locator}
     */
    plugin;

    /**
     * @type {Array<TMsg>}
     */
    thread;

    /**
     * @type {Console}
     */
    logger;

    /**
     * @type {Record<string, string>}
     */
    roles;

    /**
     * @param {TAiPayload} payload 
     */
    constructor(payload = null) {
        this.roles = {
            "system": "system",
            "tool": "tool",
            "user": "user",
        };
        this.option = {
            inThread: true,
            stream: false
        };
        this.configure(payload);
    }

    /**
     * @param {TAiPayload} payload 
     * @returns {ProviderAI} self
     */
    configure(payload) {
        const {
            logger = console,
            plugin = locator,
            thread = [],
            option,
            roles,
        } = payload || {};

        logger && (this.logger = logger);
        plugin && (this.plugin = plugin?.default || plugin);
        thread && (this.thread = thread);

        this.roles = { ...this.roles, ...roles };
        this.option = { ...this.option, ...option };

        if (this.option?.inThread && this.thread.length === 0) {
            this.setTraining()
        }
        return this;
    }

    /**
     * @description set training instructions 
     * @param {Array<TMsg>} thread
     * @returns {ProviderAI} self
     */
    setTraining(thread) {
        thread = thread || this.thread;
        if ((!this.option?.training?.name && !this.option?.training?.instructions) || !Array.isArray(thread)) {
            return this;
        }
        thread.push({
            "role": this.roles.system,
            "content": `
                You are an AI assistant named "${this.option?.training?.name}". 
                Your primary role is defined as follows:
                    ${this.option?.training?.instructions}
                Always respond clearly and concisely, adapting your tone to the context. 
                Ensure accuracy and provide step-by-step explanations when appropriate. 
                Stay within your defined scope and handle requests with professionalism and precision.
            `
        });
        return this;
    }

    /**
     * @description Safety JSON decoding
     * @param {string} str 
     * @returns {Object} result
     */
    decode(str) {
        try {
            return JSON.parse(str);
        }
        catch (_) {
            return str;
        }
    }
    /**
     * @description Safety JSON decoding
     * @param {Object} obj 
     * @returns {string} result
     */
    encode(obj) {
        try {
            return JSON.stringify(obj);
        }
        catch (_) {
            return obj;
        }
    }

    /**
     * @description RAG processing for external content based on tasks or tools calls
     * @param {Array<TTask>} tasks
     * @returns {Promise<Array<TMsg>>} results
     */
    async retrive(tasks) {
        let res = await Promise.all(tasks.map(async (task) => {
            let { type, id, function: func } = task;
            let { arguments: args, name } = func;
            let response = { role: this.roles.tool, name, tool_call_id: id };
            let result = type === "function" && await this.plugin.run({ name, args: this.decode(args) });
            if (!result) {
                response.content = "Bad plugin request, there is no content to share.";
            } else {
                response.content = this.encode({ name, output: result });
            }
            this.logger?.log({ src: "ProviderAI:retrive", data: { name, id, content: result } });
            return response;
        }));
        return res.filter(v => !!v);
    }

    /**
     * @description Overwritable function for get the task list
     * @param {TResponse} response 
     * @returns {TTask} tasks
     */
    getTasks(response) {
        return (response?.choices?.length && response?.choices[0])?.message?.tool_calls || [];
    }

    /**
     * @description Overwritable function for get the response content
     * @param {TResponse} response 
     * @returns {string} content
     */
    getContent(response) {
        return (response?.choices?.length && response?.choices[0])?.message.content;
    }

    /**
     * @description Overwritable function for prosess a group of messages in a thread
     * @param {Array<TMsg>} messages 
     * @returns {Promise<TResponse>} response 
     */
    analyse(messages) {
        return Promise.resolve({
            choices: [
                {
                    message: {
                        content: "No implementation provided"
                    }
                }
            ]
        });
    }

    /**
     * @description Overwritable function for RAG values ​​reporting
     * @param {Array<TMsg>} results 
     * @param {Array<TMsg>} thread 
     * @returns {Promise<string>} content 
     */
    async notify(results, thread) {
        if (results?.length) {
            return await this.process(results, thread);
        }
    }

    /**
     * @description Add content to the conversation thread, to keep it updated
     * @param {*} content 
     * @param {Array<TMsg>} thread 
     * @param {Object} options 
     * @param {string} options.role 
     * @returns {Array<TMsg>} thread
     */
    setThread(content, thread, options) {
        const { role = this.roles.system } = options || {};
        if (this.option?.inThread) {
            thread = thread || this.thread;
            content && thread.push({ role, content });
        }
        return thread;
    }

    /**
     * @description Get the collection of messages in a conversation thread
     * @param {*} content 
     * @param {Array<TMsg>} messages 
     * @param {Array<TMsg>} thread 
     * @returns {Array<TMsg>} thread
     */
    getThread(messages, thread) {
        if (this.option?.inThread) {
            // Keep messages in the conversation thread if required
            thread = thread || this.thread;
            for (let message of messages) {
                thread.push(message);
            }
        } else {
            // Avoid conversation thread
            thread = messages;
        }
        return thread;
    }

    /**
     * @description Prosess a group of messages in a thread
     * @param {Array<TMsg>} messages 
     * @param {Array<TMsg>} [thread] 
     * @returns {Promise<string>} content 
     */
    async process(messages, thread = null) {

        thread = this.getThread(messages, thread);

        // Process a messages list 
        const response = await this.analyse(thread);

        // process tasks or tool calls 
        const tasks = this.getTasks(response);
        if (tasks?.length) {
            let results = await this.retrive(tasks);
            let res = await this.notify(results, thread);
            if (res) {
                return res;
            }
        }

        // Get content result 
        const content = this.getContent(response);

        // Keep messages in the conversation thread if required
        this.setThread(content, thread)

        return content;
    }

    /**
     * @description Prosess a message in a thread
     * @param {string|Array<TMsg>} messages 
     * @param {Array<TMsg>} [thread] 
     * @returns {Promise<string>} content 
     */
    async run(messages, thread = null) {
        messages = typeof messages === "string" ? [{ "role": this.roles.user, "content": messages }] : messages;
        let content = await this.process(messages, thread);
        return content;
    }
}