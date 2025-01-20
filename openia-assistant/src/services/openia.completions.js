import { OpenAI } from "openai";
import config from "../../cfg/openai.js";
import * as doc from "../../cfg/documents.js";
import { ProviderAI } from "./provider.ai.js";

/**
 * @typedef  {import('../models/types.js').TMsg} TMsg
 * @typedef  {import('../models/types.js').TResponse} TResponse 
 */

export class OpenAICompletions extends ProviderAI {

    constructor(config) {
        super({
            logger: config?.logger,
            plugin: config?.plugin,
            thread: config?.thread,
            option: {
                stream: false,
                tools: config?.tools || [],
                model: config?.models["basic"],
                training: doc.assistants.basic,
                ...config?.option
            },
            roles: {
                "tool": "function",
                ...config?.roles
            }
        });

        // define OpenAI SDK
        this.driver = new OpenAI({
            apiKey: config.apiKey,
            // organization: process.env.OPENAI_ORG_ID
        });
    }

    /**
     * Assists the user by creating a new assistant, initializing a thread, and handling the user's message.
     * The assistant is configured to act as a personal math tutor, capable of writing and running Python code to answer questions.
     *
     * @param {Array<TMsg>|Stream} messages 
     * @returns {Promise<TResponse>} response 
     * @override
     */
    async analyse(messages) {
        try {
            const stream = await this.driver.chat.completions.create({
                stream: this.option.stream,
                model: this.option.model,
                tools: this.option.tools,
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

export default new OpenAICompletions(config);
