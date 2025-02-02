import WebSocket from "ws";
import KsCryp from 'kscryp';

import audioTool from "../../../common/driver/audio.js";
import speackerTool from "../../../common/driver/speacker.js";
import { Provider } from "../../../common/plugin/provider.js";

class OpenAIRealtime extends Provider {

    constructor(config) {
        super(config);
        this.state = {
            connected: "connected",
            disconnected: "disconnected",
            responseDelta: "response.audio.delta",
            responsePartDone: "response.content_part.done",
            responseDone: "response.done",
        }
        this.status = this.state.disconnected;
        this.response = {
            buffer: audioTool.gather(),
            text: ""
        };
        this.speacker = false;
    }

    clean() {
        this.response = {
            buffer: audioTool.gather(),
            text: ""
        };
    }

    send(options) {
        try {
            let { modalities, data, type = 'audio', msg } = options;

            if (!data?.length) {
                throw new Error("Empty data");
            }

            if (type === 'audio') {
                msg = { type: 'input_audio', audio: data };
                modalities = modalities || ["audio", "text"]
            } else {
                msg = { type: "input_text", text: data };
                modalities = modalities || ["text"];
            }

            this.ws.send(JSON.stringify({
                type: "conversation.item.create",
                item: {
                    type: 'message',
                    role: 'user',
                    content: [msg]
                }
            }));

            this.ws.send(KsCryp.encode({
                type: 'response.create',
                response: {
                    modalities
                    // instructions: "Give me a haiku about code.",
                }
            }, "json"));

            this.logger?.log({ src: "Provider:OpenAIRealtime:Send", data: { type, content: data?.length } });
        }
        catch (error) {
            this.logger?.error({
                src: "Provider:OpenAIRealtime:Send",
                error: error?.message,
                data: options
            });
        }
    }

    onIncoming(message) {
        try {
            const response = KsCryp.decode(message.toString(), "json");
            this.logger?.log({ src: "Provider:OpenAIRealtime:onIncoming", data: response });

            switch (response.type) {
                case this.state.responseDelta:
                    let chunk = audioTool.getChunk(response.delta);
                    this.response.buffer = audioTool.gather({ chunk, buffer: this.response.buffer });
                    this.speacker && speackerTool.talk(chunk);
                    this.onAnswer instanceof Function && this.onAnswer({
                        type: "audio",
                        content: response.delta,
                        buffer: this.response.buffer,
                        chunk
                    });
                    break;

                case this.state.responseDone:
                    let { usage, output } = response.response || {};
                    let context = Array.isArray(output) && output[0];
                    this.speacker && speackerTool.stop();
                    this.onAnswerDone instanceof Function && this.onAnswerDone({
                        type: "both",
                        usage,
                        text: this.response.text,
                        audio: this.response.buffer
                    });
                    this.clean();
                    break;

                case this.state.responsePartDone:
                    const { part } = response;
                    const text = part.transcript || part.text || "";
                    this.response.text += text;
                    this.onAnswer instanceof Function && this.onAnswer({
                        type: "text",
                        content: text,
                        data: this.response.text
                    });
                    break;
            }
        }
        catch (error) {
            this.logger?.error({ src: "Provider:OpenAIRealtime:send", error: error.toString(), data: message });
        }
    }

    async process(message = "input-01", profile) {
        let type = "text";
        if (message instanceof Buffer) {
            message = await audioTool.webmToBase64(message);
            type = "audio"
            // await audioTool.load(message, `db/${profile.name}/${profile.userId}/audio/`);
        }
        this.send({ type, data: message });
    }

    async run(messages, profile) {
        try {
            await this.connect(profile);
            this.process(messages, profile);
            return "Let me think about it";
        }
        catch (error) {
            this.logger?.error({ src: "Provider:OpenAIRealtime:Run", data: { messages, profile } });
        }
    }

    connect(profile) {
        return new Promise(async (resolve, reject) => {
            if (this.status === this.state.connected) {
                return resolve(this);
            }

            let url = profile.url || "wss://api.openai.com/v1/realtime";
            let model = await this.getModel(profile.model);

            url += "?model=" + model;

            this.ws = new WebSocket(url, {
                headers: {
                    "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
                    "OpenAI-Project": process.env.OPENAI_PROJECT,
                    "OpenAI-Beta": "realtime=v1",
                },
            });

            this.ws.onerror = (error) => {
                this.logger?.log({ src: "Provider:OpenAIRealtime:onError", error });
                reject(error);
            };

            this.ws.on("open", () => {
                this.status = this.state.connected;
                this.logger?.log({ src: "Provider:OpenAIRealtime:Connected" });
                resolve(this);
            });

            this.ws.on("message", this.onIncoming.bind(this));
        });
    }

    disconnect() {
        this.status = this.state.disconnected;
    }
}

export default OpenAIRealtime;