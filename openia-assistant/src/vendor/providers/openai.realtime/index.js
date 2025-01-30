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
    }

    clean() {
        this.response = {
            buffer: audioTool.gather(),
            text: ""
        };
    }

    send(base64AudioData) {
        try {
            if (!base64AudioData?.length) {
                throw new Error("Empty data");
            }
            this.ws.send(JSON.stringify({
                type: "conversation.item.create",
                item: {
                    type: 'message',
                    role: 'user',
                    content: [
                        {
                            type: 'input_audio',
                            audio: base64AudioData
                        }
                    ]
                }
            }));
            this.ws.send(KsCryp.encode({
                type: 'response.create',
                response: {
                    modalities: ["audio", "text"],
                    // instructions: "Give me a haiku about code.",
                }
            }, "json"));
            this.logger?.log({ src: "Provider:OpenAIRealtime:Send", data: { content: base64AudioData?.length } });
        }
        catch (error) {
            this.logger?.error({
                src: "Provider:OpenAIRealtime:Send",
                error: error?.message,
                data: { content: base64AudioData?.length }
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
                    audioTool.gather({ chunk, buffer: this.response.buffer });
                    speackerTool.talk(chunk);
                    this.answer && this.answer({
                        type: "buffer",
                        chunk,
                        buffer: this.response.buffer
                    });
                    break;

                case this.state.responseDone:
                    speackerTool.stop();
                    break;

                case this.state.responsePartDone:
                    const { part } = response;
                    this.response.text += part.transcript;
                    this.answer && this.answer({
                        type: "text",
                        content: part.transcript
                    });
                    break;
            }
        }
        catch (error) {
            this.logger?.error({ src: "Provider:OpenAIRealtime:send", error: error.toString(), data: message });
        }
    }

    async process(message = "input-01", profile) {
        const tmp = message instanceof Buffer
            ? message
            : await audioTool.load(message, `db/${profile.name}/${profile.userId}/audio/`);
        const base64AudioData = await audioTool.webmToBase64(tmp)
        this.send(base64AudioData)
    }

    async run(messages, profile, answer) {
        try {
            this.answer = answer instanceof Function ? answer : null;
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