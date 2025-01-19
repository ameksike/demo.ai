import * as locator from '../utils/locator.js';

/**
 * @typedef  {import('../models/types.js').TMsg} TMsg
 * @typedef  {import('../models/types.js').TTask} TTask
 * @typedef  {import('../models/types.js').TResponse} TResponse
 */

export class BaseAIService {

    /**
     * @type {typeof locator}
     */
    plugin;

    /**
     * @type {Array<TMsg>}
     */
    thread;

    /**
     * @type {boolean}
     */
    inThread;

    constructor(options = null) {
        const { plugin = locator, thread = [], training, inThread = true } = options || {};

        this.plugin = plugin.default;
        this.thread = thread;
        this.inThread = inThread;

        if (this.inThread && Array.isArray(this.thread) && training?.name) {
            this.thread.push({
                "role": "system",
                "content": `
                    You are an AI assistant named "${training?.name}". 
                    Your primary role is defined as follows:
                        ${training?.instructions}
                    Always respond clearly and concisely, adapting your tone to the context. 
                    Ensure accuracy and provide step-by-step explanations when appropriate. 
                    Stay within your defined scope and handle requests with professionalism and precision.
                `
            });
        }
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
     * @param {Array<Object>} tasks
     * @returns {Promise<Array<TMsg>>} results
     */
    async retrive(tasks) {
        let res = await Promise.all(tasks.map(async (task) => {
            let { type, id, function: func } = task;
            let { arguments: args, name } = func;
            let result = type === "function" && await this.plugin.run({ name, args: this.decode(args) });
            if (!result) {
                return null;
            }
            return { role: 'tool', content: this.encode({ toolCallId: id, toolName: name, output: result }) };
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
     * @param {<Array<TMsg>} results 
     * @param {<Array<TMsg>} thread 
     * @returns {Promise<string>} content 
     */
    async notify(results, thread) {
        if (results?.length) {
            return await this.process(results, thread);
        }
    }

    /**
     * @description Prosess a group of messages in a thread
     * @param {Array<TMsg>} messages 
     * @param {Array<TMsg>} [thread] 
     * @returns {Promise<string>} content 
     */
    async process(messages, thread = null) {

        if (this.inThread) {
            // Keep messages in the conversation thread if required
            thread = thread || this.thread;
            for (let message of messages) {
                thread.push(message);
            }
        } else {
            // Avoid conversation thread
            thread = message;
        }

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
        if (content && this.inThread) {
            thread.push({ "role": "system", content });
        }
        return content;
    }

    /**
     * @description Prosess a message in a thread
     * @param {string|Array<TMsg>} messages 
     * @param {Array<TMsg>} [thread] 
     * @returns {Promise<string>} content 
     */
    async run(messages, thread = null) {
        messages = typeof messages === "string" ? [{ "role": "user", "content": messages }] : messages;
        let content = await this.process(messages, thread);
        return content;
    }
}