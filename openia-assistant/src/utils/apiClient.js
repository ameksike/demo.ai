import openai from "../config/openaiConfig.js";

export const generateAssistantResponse = async (messages) => {
    try {
        const response = await openai.createChatCompletion({
            model: "gpt-4",
            messages,
        });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error generating response: ", error);
    }
};
