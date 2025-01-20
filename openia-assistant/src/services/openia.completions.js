import { OpenAI } from "openai";
import config from "../../cfg/openai.js";
import * as doc from "../../cfg/documents.js";
import { ProviderAI } from "./provider.ai.js";

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
