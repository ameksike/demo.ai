import fetchApi from '../utils/fetch.api.js';
import config from "../../cfg/openai.js";
import * as doc from "../../cfg/documents.js";
import { ProviderAI } from "./provider.ai.js";

/**
 * @link https://lmstudio.ai/docs/api/rest-api
 */

const {
    LLAMA_API_URL = "http://127.0.0.1:1234"
} = process.env;

export class LlanaAICompletions extends ProviderAI {
    constructor(config) {
        super({
            logger: config?.logger,
            plugin: config?.plugin,
            thread: config?.thread,
            roles: config?.roles,
            option: {
                stream: false,
                tools: config?.tools || [],
                model: config?.models["lmstudio"],
                training: doc.assistants.basic,
                ...config?.option
            },
        });
    }

    /**
     * @description Overwritable function for prosess a group of messages in a thread
     * @param {Array<TMsg>} thread 
     * @returns {Promise<TResponse>} response 
     */
    async analyse(messages) {
        try {
            const stream = await this.send({
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

    /**
     * @description Send message 
     * @param {*} options 
     * @returns {Promise<TResponse>} response 
     */
    async send(options) {
        try {
            const { stream, model, tools, messages } = options || {};
            const response = await fetchApi.post(LLAMA_API_URL + "/v1/chat/completions", {
                model,
                messages,
                tools,
                temperature: 0.7,
                max_tokens: 600,
            });
            return response.body;
        } catch (error) {
            return {
                choices: [
                    {
                        message: {
                            content: "ERROR: " + error.response?.data || error.message
                        }
                    }
                ]
            };
        }
    }
}

export default new LlanaAICompletions(config);
