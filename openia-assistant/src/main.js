import { trainingDocuments } from "./training/documents.js";
import { generateAssistantResponse } from "./utils/apiClient.js";
import { sendEmail } from "./services/emailService.js";
import { createCalendarEvent } from "./services/calendarService.js";
import { executeExternalTask } from "./services/externalTaskExecutor.js";

const main = async () => {
    // Example: Add training documents to the conversation
    const messages = [...trainingDocuments];

    // User interaction
    messages.push({ role: "user", content: "Can you schedule a meeting tomorrow at 3 PM with John?" });

    const assistantResponse = await generateAssistantResponse(messages);
    console.log("Assistant: ", assistantResponse);

    // Execute based on response
    if (assistantResponse.includes("schedule a meeting")) {
        await createCalendarEvent({
            summary: "Meeting with John",
            start: { dateTime: "2025-01-18T15:00:00-07:00" },
            end: { dateTime: "2025-01-18T16:00:00-07:00" },
        });
    }

    if (assistantResponse.includes("send an email")) {
        await sendEmail("john@example.com", "Meeting Confirmation", "Let's meet tomorrow at 3 PM.");
    }

    if (assistantResponse.includes("execute task")) {
        await executeExternalTask("https://example.com/task", { key: "value" });
    }
};

main();
