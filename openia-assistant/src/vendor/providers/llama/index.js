import fetchApi from '../../../common/utils/fetch.api.js';
import { Provider } from "../../../common/plugin/provider.js";

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

class LlamaAICompletions extends Provider {

    /**
     * @description Overwritable function for prosess a group of messages in a thread
     * @param {Array<TMsg>} messages 
     * @param {TProfile} profile 
     * @returns {Promise<TResponse>} response 
     */
    async analyse(messages, profile) {
        try {
            const stream = await this.send({
                url: profile.url,
                stream: profile.stream,
                tools: profile.tools,
                model: await this.getModel(profile.model),
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
            const {
                stream = false,
                model,
                tools,
                messages,
                temperature = 0.7,
                max_tokens = 600,
                url = LLAMA_API_URL + "/v1/chat/completions"
            } = options || {};
            const body = { stream, model, messages, tools, temperature, max_tokens, };
            const response = await fetchApi.post(url, body);
            if (response.error) {
                throw response.error;
            }
            return response.body;
        } catch (error) {
            this.logger?.error({ src: "Provider:LlamaAI:send", error, data: options });
            return {
                choices: [
                    {
                        message: {
                            content: "ERROR: " + (error.response?.data || error.message)
                        }
                    }
                ]
            };
        }
    }
}

export default LlamaAICompletions;
