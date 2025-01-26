import OpenAICompletions from "../openia.completions/index.js";

/**
 * @typedef  {import('../../../models/types.js').TMsg} TMsg
 * @typedef  {import('../../../models/types.js').TTask} TTask
 * @typedef  {import('../../../models/types.js').TResponse} TResponse 
 * @typedef  {import('../../../models/profile.js').Profile} TProfile 
 */

class OpenAIAssistant extends OpenAICompletions {

    constructor(config) {
        config = config || {};
        config.persist = false;

        super(config);
        this.cache = {};
        this.defaults = config?.defaults || {};
    }

    /**
     * @param {Object} payload 
     * @param {Object} payload.thread
     * @param {Array<TMsg>} payload.messages 
     * @returns {APIPromise<Message>} message
     */
    async addMesage(payload) {
        const { thread, messages } = payload;
        return await Promise.all(messages.map(message => this.driver.beta.threads.messages.create(thread.id, {
            role: message.role || "user",
            content: message.content
        })));
    }

    /**
     * @description Retrieve or create a remote thread 
     * @returns {Promise<Object|null>} Thread
     */
    async getAssistantThread(profile = {}) {
        try {
            if (this.cache.thread) {
                return this.cache?.thread;
            }

            this.cache.thread = profile?.defaults?.thread
                ? await this.driver.beta.threads.retrieve(profile?.defaults?.thread)
                : await this.driver.beta.threads.create();

            profile.defaults = profile.defaults || {};
            profile.defaults.thread = this.cache.thread.id;
            this.logger?.log({ src: "Provider:OpenAI:Assistant:getAssistantThread", data: { threadId: this.cache.thread.id } });
            return this.cache.thread;
        }
        catch (error) {
            this.logger?.error({ src: "Provider:OpenAI:Assistant:getAssistantThread", error });
            return null;
        }
    }

    /**
     * @description Create assistant and thread resouces
     * @returns {Promise<Object|null>} Assistant
     */
    async getAssistant(profile = {}) {
        try {
            if (this.cache.assistant) {
                return this.cache?.assistant;
            }

            this.cache.assistant = profile.defaults?.assistant
                ? await this.driver.beta.assistants.retrieve(profile.defaults?.assistant)
                : await this.driver.beta.assistants.create({
                    instructions: profile?.training?.instructions,
                    name: profile.training?.name,
                    model: profile.model,
                    tools: profile.tools,
                });

            profile.defaults = profile.defaults || {};
            profile.defaults.assistant = this.cache.assistant.id;
            this.logger?.log({ src: "Provider:OpenAI:Assistant:getAssistant", data: { assistantId: this.cache.assistant.id } });
            return this.cache?.assistant;
        }
        catch (error) {
            this.logger?.error({ src: "Provider:OpenAI:Assistant:getAssistant", error });
            return null;
        }
    }

    /**
     * @description Utility to collect all Tool Calls from the stream events
     * @param {Object} event 
     * @param {Array<TTask>} taskList 
     * @returns {Array<TTask>} toolCalls
     */
    collectToolCalls(event, taskList) {
        const toolCalls = event?.data?.delta?.step_details?.tool_calls || [];
        for (const toolCall of toolCalls) {
            const { index } = toolCall;
            if (!taskList[index]) {
                taskList[index] = toolCall;
            }
            taskList[index].function.arguments += toolCall.function.arguments;
        }
        return taskList;
    }

    /**
     * @description precess the stream data 
     * @param {Stream} stream 
     * @returns {TResponse} response
     */
    async fromStream(stream) {
        let toolCalls = null;
        let content = null;
        for await (const item of stream) {

            this.logger?.log({ src: "Provider:OpenAI:Assistant:fromStream", data: item });

            if (item?.event === 'thread.run.created') {
                this.cache.run = item?.data;
            }
            if (item?.event === 'thread.message.completed') {
                content = item?.data?.content;
                content = Array.isArray(content) ? content.map(elm => (elm?.type === "text" && elm?.text?.value) || "").join(" ") : content;
            }
            toolCalls = toolCalls || item?.data?.required_action?.submit_tool_outputs?.tool_calls;
        }
        return {
            choices: [
                {
                    message: {
                        content,
                        tool_calls: toolCalls || []
                    }
                }
            ]
        };
    }

    /**
     * @description Overwritable function for RAG values ​​reporting
     * @param {Array<TMsg>} results 
     * @param {Array<TMsg>} thread 
     * @returns {Promise<string>} content 
     */
    async notify(results, thread) {
        try {
            const toolOutput = results.map(item => ({ output: item.content, tool_call_id: item.tool_call_id }));
            const stream = await this.driver.beta.threads.runs.submitToolOutputs(
                this.cache.thread.id,
                this.cache.run.id,
                {
                    tool_outputs: toolOutput,
                    stream: true
                }
            );

            return await this.process(stream, thread);
        }
        catch (error) {
            this.logger?.log({ src: "Provider:OpenAI:Assistant:notify", error });
            return null;
        }
    }

    /**
     * Assists the user by creating a new assistant, initializing a thread, and handling the user's message.
     * The assistant is configured to act as a personal math tutor, capable of writing and running Python code to answer questions.
     *
     * @param {Array<TMsg>|Stream} messages 
     * @param {TProfile} profile 
     * @returns {Promise<TResponse>} response 
     * @override
     */
    async analyse(messages, profile) {
        try {
            let [assistant, thread] = await Promise.all([
                this.getAssistant(profile),
                this.getAssistantThread(profile)
            ]);

            messages?.length && (await this.addMesage({ thread, messages }));

            let stream = messages?.constructor?.name === "Stream"
                ? messages
                : await this.driver.beta.threads.runs.create(
                    thread.id,
                    {
                        assistant_id: assistant.id,
                        stream: true
                    }
                );

            let result = await this.fromStream(stream);
            return result;
        } catch (error) {
            this.logger?.error({ src: "Provider:OpenAI:Assistant:analyse", error });
            return {
                choices: [
                    {
                        message: {
                            content: "OpenAI ERROR: " + error.message
                        }
                    }
                ]
            }
        }
    }

}

export default OpenAIAssistant;