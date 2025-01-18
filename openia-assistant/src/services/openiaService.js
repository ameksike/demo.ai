import { OpenAI } from "openai";
import config from "../config/openai.js";

export const openai = new OpenAI({
    apiKey: config.apiKey,
    // organization: process.env.OPENAI_ORG_ID
});

/**
 * Process a message using OpenAI SDK
 * @link https://platform.openai.com/docs/api-reference/chat
 * @param {string} message 
 * @returns {Promise<{content: string, tasks: any[]}>}
 */
export async function process(message) {
    try {
        const { models, tools } = config;
        const completion = await openai.chat.completions.create({
            model: models["simple"],
            messages: [{ role: "user", content: message }],
            tools,
        });

        console.log("<<<<< OpenIA RES: ", completion.choices);

        const lst = [];
        const res = completion.choices[0];
        for (const task of res.message.tool_calls) {
            lst.push({
                name: task.function.name,
                description: task.function.description,
                parameters: JSON.parse(task.function.arguments),
            });
        }
        return {
            content: res.message.content,
            tasks: lst,
        };
    }
    catch (error) {
        return {
            content: "OpenAI ERROR: " + error.message,
            tasks: [],
        };
    }
}

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
