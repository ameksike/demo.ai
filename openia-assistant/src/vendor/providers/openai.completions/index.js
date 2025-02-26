import { OpenAI } from "openai";
import { Provider } from "../../../common/plugin/provider.js";

/**
 * @typedef  {import('../../../common/types.js').TMsg} TMsg
 * @typedef  {import('../../../common/types.js').TResponse} TResponse 
 * @typedef  {import('../../../models/profile.js').Profile} TProfile 
 */

class OpenAICompletions extends Provider {

    constructor(config) {
        config = config || {};
        config.roles = { "tool": "function", ...config?.roles }
        super(config);

        // define OpenAI SDK
        this.driver = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            // organization: process.env.OPENAI_ORG_ID
        });
    }

    /**
     * @description Check message compatibility between providers, If profile.compatible is active it has a negative impact on performance
     * @param {Array<TMsg>} messages 
     * @param {TProfile} profile 
     * @returns {Promise<Array<TMsg>>} messages 
     */
    checkMessages(messages, profile) {
        return Promise.resolve(profile?.compatible && Array.isArray(messages) ? messages.map(message => {
            message.role = message.role === "tool" ? this.roles.tool : message.role;
            this.logger?.log({ src: "Provider:OpenAI:Completions:checkMessages", data: { role: message.role } });
            return message;
        }) : messages);
    }

    /**
     * Assists the user by creating a new assistant, initializing a thread, and handling the user's message.
     * The assistant is configured to act as a personal math tutor, capable of writing and running Python code to answer questions.
     *
     * @param {Array<TMsg>} messages 
     * @param {TProfile} profile 
     * @returns {Promise<TResponse>} response 
     * @override
     */
    async analyse(messages, profile) {
        try {
            const stream = await this.driver.chat.completions.create({
                stream: profile.stream,
                model: await this.getModel(profile.model),
                tools: profile.tools,
                messages,
            });
            return stream;
        }
        catch (error) {
            this.logger?.error({ src: "Provider:OpenAI:Completions:analyse", error });
            return {
                choices: [
                    {
                        message: {
                            content: "OpenAI ERROR: " + error.message
                        }
                    }
                ]
            };
        }
    }
}

export default OpenAICompletions;
