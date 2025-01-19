export const assistants = {
    basic: {
        instructions: "You are a personal math tutor. When asked a question, write and run Python code to answer the question.",
        name: "Math Tutor",
    }
}

export const trainingDocuments = [
    {
        role: "system",
        content: "You are an assistant that helps with email, calendar management, and external task execution.",
    },
    {
        role: "user",
        content: "How can I schedule a meeting?",
    },
    {
        role: "assistant",
        content: "You can provide the details like date, time, and participants, and I'll schedule it for you.",
    },
];
