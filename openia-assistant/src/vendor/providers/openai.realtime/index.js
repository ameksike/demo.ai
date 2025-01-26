import WebSocket from "ws";
import KsCryp from 'kscryp';

import audioTool from "../../../common/audio.js";
import speackerTool from "../../../common/speacker.js";
import { ProviderAI } from "../../../common/provider.ai.js";

class OpenAIRealtime extends ProviderAI {

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
        this.defaults = {
            buffer: audioTool.gather()
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
            this.logger?.log({ src: "Provider:OpenAIRealtime:Send", error, data: { content: base64AudioData?.length } });
        }
    }

    onIncoming(message) {
        try {
            const response = KsCryp.decode(message.toString(), "json");
            this.logger?.log({ src: "Provider:OpenAIRealtime:onIncoming", data: response });
            switch (response.type) {
                case this.state.responseDelta:
                    let chunk = audioTool.getChunk(response.delta);
                    audioTool.gather({ chunk, buffer: this.defaults.buffer });
                    speackerTool.talk(chunk);
                    break;

                case this.state.responseDone:
                    speackerTool.stop();
                    break;

                case this.state.responsePartDone:
                    const { part } = response;
                    console.log(part.transcript);
                    console.log("\n");
                    break;
            }
        }
        catch (error) {
            this.logger?.error({ src: "Provider:OpenAIRealtime:send", error: error.toString(), data: message });
        }
    }

    async ask(message = "input-01", profile) {
        const tmp = await audioTool.load(message, "db/" + profile.name + "/audio/")
        const base64AudioData = await audioTool.toBase64(tmp)
        this.send(base64AudioData)
    }

    async run(message, profile) {
        try {
            await this.connect(profile);
            this.ask(message, profile);
            return "Let me think about it";
        }
        catch (error) {
            this.logger?.error({ src: "Provider:OpenAIRealtime:Run", data: { messages, profile } });
        }
    }

    connect(profile) {
        return new Promise((resolve, reject) => {
            if (this.status === this.state.connected) {
                return resolve(this);
            }

            let url = profile.url || "wss://api.openai.com/v1/realtime";
            url += "?model=" + profile.model;

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