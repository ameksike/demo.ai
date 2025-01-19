import { OpenAI } from "openai";
import config from "../config/openai.js";
import * as doc from "../training/documents.js";

export const openai = new OpenAI({
    apiKey: config.apiKey,
    // organization: process.env.OPENAI_ORG_ID
});

/**
 * Create assistant and thread resouces
 * @returns {Promise<{assistant?: Object, thread?: Object, error?: Object}>}
 */
export async function getAssistant() {
    try {
        const { models, tools, defaults } = config;
        // Create a new assistant with the specified instructions, name, tools, and model
        const assistant = defaults?.assistant
            ? await openai.beta.assistants.retrieve(defaults.assistant)
            : await openai.beta.assistants.create({
                instructions: doc?.assistants?.basic?.instructions,
                name: doc?.assistants?.basic.name,
                tools,
                model: models["simple"],
            });

        const thread = defaults?.thread
            ? await openai.beta.threads.retrieve(defaults.thread)
            : await openai.beta.threads.create();

        /*const run = await openai.beta.threads.runs.create(
            thread.id,
            { assistant_id: assistant.id }
        );*/

        console.log('Thread initialized:', thread.id);
        console.log('Assistant created:', assistant.id);

        return { assistant, thread };
    }
    catch (error) {
        return { error };
    }
}

async function addMesage({ thread, content }) {
    await openai.beta.threads.messages.create(thread.id, { role: "user", content });
    const stream = openai.beta.threads.runs.stream(thread.id, {
        assistant_id: assistantId,
    });
    return stream.toReadableStream();
}

/**
 * Assists the user by creating a new assistant, initializing a thread, and handling the user's message.
 * The assistant is configured to act as a personal math tutor, capable of writing and running Python code to answer questions.
 *
 * @param {string} message - The user's message to be processed by the assistant.
 * @returns {Promise<string>} - The assistant's response to the user's message.
 * @throws {Error} - If an error occurs while handling the user's message.
 */
export async function assist(message) {
    try {
        config.assistant.basic = config.assistant.basic || await getAssistant();
        const { assistant, thread, error } = config.assistant.basic;

        if (error) {
            console.log('Assistant error:', error);
            return { error };
        }

        const msg = await addMesage({ thread, content: message });

        const run = await openai.beta.threads.runs.createAndPoll(
            thread.id,
            {
                assistant_id: assistant.id,
                instructions: "Please address the user as Jane Doe. The user has a premium account."
            }
        );

        if (run.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(
                run.thread_id
            );
            for (const message of messages.data.reverse()) {
                console.log(`${message.role} > ${message.content[0].text.value}`);
            }
        } else {
            console.log(run.status);
        }

        /*const run = openai.beta.threads.runs
            .stream(thread.id, { assistant_id: assistant.id })
            .on('textCreated', (text) => {
                // process.stdout.write('\nassistant > ')
                console.log("textCreated", text);
            })
            .on('textDelta', (textDelta, snapshot) => {
                // process.stdout.write(textDelta.value)
                console.log("textDelta", { textDelta, snapshot });
            })
            .on('toolCallCreated', (toolCall) => {
                // process.stdout.write(`\nassistant > ${toolCall.type}\n\n`)
                console.log("toolCallCreated", { toolCall });
            })
            .on('toolCallDelta', (toolCallDelta, snapshot) => {
                console.log("toolCallDelta", { toolCallDelta, snapshot });

                if (toolCallDelta.type === 'code_interpreter') {
                    if (toolCallDelta.code_interpreter.input) {
                        console.log("toolCallDelta:code_interpreter", toolCallDelta.code_interpreter);
                        // process.stdout.write(toolCallDelta.code_interpreter.input);
                    }
                    if (toolCallDelta.code_interpreter.outputs) {
                        // process.stdout.write("\noutput >\n");
                        toolCallDelta.code_interpreter.outputs.forEach(output => {
                            console.log("toolCallDelta:code_interpreter:outputs", output);
                            /*if (output.type === "logs") {
                                process.stdout.write(`\n${output.logs}\n`);
                            }
                        });
                    }
                }
            });*/

        console.log("message", msg);
        console.log("run", run);
        /*// Check if the assistant calls a function
        if (response.data?.function_call) {
            const { name, arguments: args } = response.data.function_call;
            console.log(`Assistant called function: ${name}`, args);

            // Execute the corresponding action
            const actionResult = await handleAction(name, JSON.parse(args));

            // Inform the assistant about the result of the function call
            const finalResponse = await openai.threads.sendMessage({
                threadId: thread.id,
                message: {
                    role: 'function',
                    name,
                    content: JSON.stringify(actionResult),
                },
            });

            return finalResponse.data.choices[0].message.content;
        }
        // Return the assistant's response if no function is called*/
        return {
            content: "AAAA",
            tasks: [],
        };
    } catch (error) {
        return {
            content: "OpenAI ERROR: " + error.message,
            tasks: [],
        };
    }
}

/**
 * Process a message using OpenAI SDK
 * @link https://platform.openai.com/docs/api-reference/chat
 * @param {string} message 
 * @returns {Promise<{content: string, tasks: any[]}>}
 */
export async function process(message) {
    try {
        const { models, tools } = config;
        const stream = await openai.chat.completions.create({
            model: models["basic"],
            messages: [{ role: "user", content: message }],
            tools,
            // stream: true,
        });

        /*for await (const chunk of stream) {
            process.stdout.write(
                chunk.choices[0]?.delta?.content || ""
            );
        }*/

        console.log("<<<<< OpenIA RES: ", stream);

        let tasks = [];
        let content = "";

        if (Array.isArray(stream.choices)) {
            for (let choice of stream.choices) {
                if (Array.isArray(choice?.message?.tool_calls)) {
                    for (const task of choice.message.tool_calls) {
                        tasks.push({
                            id: task.id,
                            type: task.type,
                            name: task.function?.name,
                            parameters: task?.function?.arguments && JSON.parse(task.function.arguments),
                        });
                    }
                }
                content += choice?.message?.content || "";
            }
        }

        return { content, tasks };
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
