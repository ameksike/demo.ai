import openai from "../services/openaiService";
import config from "../config/openai";

export const generateAssistantResponse = async (messages) => {
    try {
        const response = await openai.createChatCompletion({
            model: config.models["gpt-3.5"],
            messages,
        });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error generating response: ", error);
    }
};
