import { Plugin } from './plugin.js';
import KsCryp from 'kscryp';

/**
 * @typedef  {import('../types.js').TMsg} TMsg
 * @typedef  {import('../types.js').TTask} TTask
 * @typedef  {import('../types.js').TResponse} TResponse 
 * @typedef  {import('../types.js').TAiPayload} TAiPayload 
 * @typedef  {import('../../modules/profile/services/profile.js').Profile} TProfile 
 */

export class Provider extends Plugin {

    /**
     * @type {Record<string, string>}
     */
    roles;

    /**
     * @type {Boolean}
     */
    persist

    /**
     * @param {TAiPayload} payload 
     */
    constructor(options = null) {
        super(options)
        this.roles = {
            "assistant": "assistant",
            "system": "system",
            "tool": "tool",
            "user": "user",
        };
        this.configure(options);
    }

    async getModel(alias) {
        try {
            return (await this.metadata)?.models[alias]
        }
        catch (error) {
            this.logger?.error({ src: "Provider:getModel", error: error?.message, data: { alias } });
        }
    }

    /**
     * @description transform a string to TMsg
     * @param {String} content 
     * @returns {TMsg} message
     */
    asMessage(content) {
        return {
            choices: [
                {
                    message: {
                        content
                    }
                }
            ]
        }
    }

    /**
     * @param {TAiPayload} payload 
     * @returns {Provider} self
     */
    configure(payload) {
        const { persist = true, roles } = payload || {};
        this.persist = persist ?? true;
        this.roles = { ...this.roles, ...roles };
        return this;
    }

    /**
     * @description RAG processing for external content based on tasks or tools calls
     * @param {Array<TTask>} tasks
     * @param {TProfile} profile 
     * @returns {Promise<Array<TMsg>>} results
     */
    async retrive(tasks, profile) {
        let res = await Promise.all(tasks.map(async (task) => {
            let { type, id, function: func } = task;
            let { arguments: args, name } = func;
            let response = { role: this.roles.tool, name, tool_call_id: id };
            let result = type === "function" && await this.ioc.run({ name, args: [KsCryp.decode(args, "json"), task, profile] });
            if (!result) {
                response.content = "Bad plugin request, there is no content to share.";
            } else {
                response.content = KsCryp.encode({ name, output: result }, "json");
            }
            this.logger?.log({ src: "Provider:retrive", data: { name, id, content: result } });
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
     * @description Check message compatibility between providers, If profile.compatible is active it has a negative impact on performance
     * @param {Array<TMsg>} messages 
     * @param {TProfile} profile 
     * @returns {Array<TMsg>} messages 
     */
    checkMessages(messages, profile) {
        return Promise.resolve(profile?.compatible && Array.isArray(messages) ? messages.map(message => {
            this.logger?.log({ src: "Provider:checkMessages", data: { old: message.role, new: this.roles.tool } });
            message.role = message.role === "function" ? this.roles.tool : message.role;
            return message;
        }) : messages);
    }

    /**
     * @description Overwritable function for prosess a group of messages in a thread
     * @param {Array<TMsg>} messages 
     * @param {TProfile} profile 
     * @returns {Promise<TResponse>} response 
     */
    analyse(messages, profile) {
        return Promise.resolve(this.asMessage("No implementation provided"));
    }

    /**
     * @description Overwritable function for RAG values ​​reporting
     * @param {Array<TMsg>} results 
     * @param {TProfile} profile 
     * @returns {Promise<string>} content 
     */
    async notify(results, profile) {
        if (results?.length) {
            return await this.process(results, profile);
        }
    }

    /**
     * @description Prosess a group of messages in a thread
     * @param {Array<TMsg>} messages 
     * @param {Array<TMsg>} [thread] 
     * @returns {Promise<string>} content 
     */
    async process(messages, profile = {}) {
        // Control data persistence from Provider
        profile.persist = profile.persist && this.persist;
        profile.roles = { ...profile.roles, ...this.roles };

        // Get the current conversation thread
        const thread = Array.isArray(messages) ? profile?.process(messages) : messages;

        // Verify the compatibility of messages 
        const msgs = await this.checkMessages(thread, profile);

        // Process a messages list 
        const response = await this.analyse(msgs, profile);

        // process tasks or tool calls 
        const tasks = this.getTasks(response);
        if (tasks?.length) {
            let results = await this.retrive(tasks, profile);
            let res = await this.notify(results, profile);
            if (res) {
                return res;
            }
        }

        // Get content result 
        const content = this.getContent(response);

        // Keep messages in the conversation thread if required
        profile?.process(content);

        return content;
    }

    /**
     * @description Prosess a message in a thread
     * @param {string|Array<TMsg>} messages 
     * @param {Array<TMsg>} [thread] 
     * @returns {Promise<string>} content 
     */
    async run(messages, profile) {
        try {
            messages = typeof messages === "string" ? [{ "role": this.roles.user, "content": messages }] : messages;
            let content = await this.process(messages, profile);
            return content;
        }
        catch (error) {
            this.logger?.error({ src: "Provider:run", data: { messages, profile } });
        }
    }
}