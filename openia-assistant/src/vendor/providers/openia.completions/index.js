import { OpenAI } from "openai";
import config from "../../../../cfg/config.js";
import * as doc from "../../../../cfg/documents.js";
import { ProviderAI } from "../../../common/provider.ai.js";

/**
 * @typedef  {import('../../../common/types.js').TMsg} TMsg
 * @typedef  {import('../../../common/types.js').TResponse} TResponse 
 * @typedef  {import('../../../models/profile.js').Profile} TProfile 
 */

class OpenAICompletions extends ProviderAI {

    constructor(config) {
        super({
            logger: config?.logger,
            plugin: config?.plugin,
            roles: {
                "tool": "function",
                ...config?.roles
            }
        });

        // define OpenAI SDK
        this.driver = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            // organization: process.env.OPENAI_ORG_ID
        });
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
                model: profile.model,
                tools: profile.tools,
                messages,
            });
            return stream;
        }
        catch (error) {
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
