import fetchApi from '../../../common/fetch.api.js';
import { ProviderAI } from "../../../common/provider.ai.js";

/**
 * @link https://lmstudio.ai/docs/api/rest-api
 */

/**
 * @typedef  {import('../../../models/types.js').TMsg} TMsg
 * @typedef  {import('../../../models/types.js').TTask} TTask
 * @typedef  {import('../../../models/profile.js').Profile} TProfile 
 */

const {
    LLAMA_API_URL = "http://127.0.0.1:1234"
} = process.env;

class LlanaAICompletions extends ProviderAI {

    /**
     * @description Overwritable function for prosess a group of messages in a thread
     * @param {Array<TMsg>} messages 
     * @param {TProfile} profile 
     * @returns {Promise<TResponse>} response 
     */
    async analyse(messages, profile) {
        try {
            const stream = await this.send({
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

export default LlanaAICompletions;
