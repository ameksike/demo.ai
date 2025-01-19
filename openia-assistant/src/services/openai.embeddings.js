import { OpenAI } from "openai";
import config from "../../cfg/openai.js";

export const openai = new OpenAI({
    apiKey: config.apiKey,
    // organization: process.env.OPENAI_ORG_ID
});

/**
 * Get embeddings for a message
 * @link https://platform.openai.com/docs/guides/embeddings
 * @param {string} message 
 * @returns {Promise<{data: any}>}
 */
export async function getEmbeddings(message) {
    try {
        const embedding = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: message,
            encoding_format: "float",
        });
        /**
            {
                "object": "list",
                "data": [
                    {
                        "object": "embedding",
                        "index": 0,
                        "embedding": [
                            -0.006929283495992422,
                            -0.005336422007530928,
                            -4.547132266452536e-05,
                            -0.024047505110502243
                        ],
                    }
                ],
                "model": "text-embedding-3-small",
                "usage": {
                    "prompt_tokens": 5,
                    "total_tokens": 5
                }
            }
        */
        return { data: embedding.data[0] };
    }
    catch (error) {
        return { error }
    }
}

export default openai;
