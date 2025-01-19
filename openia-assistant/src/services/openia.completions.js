import { OpenAI } from "openai";
import config from "../../cfg/openai.js";
import * as doc from "../../cfg/documents.js";
import { ProviderAI } from "./provider.ai.js";

export class OpenAICompletions extends ProviderAI {
    constructor(config) {
        super({ training: doc.assistants.basic, roles: { "tool": "function" } });

        // define OpenAI SDK
        this.driver = new OpenAI({
            apiKey: config.apiKey,
            // organization: process.env.OPENAI_ORG_ID
        });

        // Preconfigure options 
        this.option = {
            stream: false,
            model: config?.models["basic"],
            tools: config?.tools || []
        };
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
