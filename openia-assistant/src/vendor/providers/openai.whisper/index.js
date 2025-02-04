import WebSocket from "ws";
import KsCryp from 'kscryp';

import audioTool from "../../../common/driver/audio.js";
import speackerTool from "../../../common/driver/speacker.js";
import { Provider } from "../../../common/plugin/provider.js";

class OpenAIWhisper extends Provider {

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

        // define OpenAI SDK
        this.driver = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            // organization: process.env.OPENAI_ORG_ID
        });
    }

    clean() {
        this.response = {
            buffer: audioTool.gather(),
            text: ""
        };
    }

    async send(options) {
        try {
            let { modalities, data, type = 'audio', msg } = options;

            const transcription = await this.driver.audio.transcriptions.create({
                file: combinedBuffer,
                model: 'whisper-1',
            });

            console.log('Transcription:', transcription.text);

            // Generar audio a partir de la transcripción
            const audioResponse = await this.driver.audio.speech.create({
                input: transcription.text,
                voice: 'alloy',
                response_format: 'mp3',
            });

            const audioBufferResponse = await audioResponse.arrayBuffer();

            this.onAnswerDone instanceof Function && this.onAnswerDone({
                type: "both",
                usage: audioResponse.usage,
                text: transcription.text,
                audio: Buffer.from(audioBufferResponse)
            });

            ws.send(Buffer.from(audioBufferResponse));

            this.logger?.log({ src: "Provider:OpenAIWhisper:Send", data: { type, content: data?.length } });
        }
        catch (error) {
            this.logger?.error({
                src: "Provider:OpenAIWhisper:Send",
                error: error?.message,
                data: options
            });
        }
    }

    onIncoming(message) {
        try {
            const response = KsCryp.decode(message.toString(), "json");
            this.logger?.log({ src: "Provider:OpenAIWhisper:onIncoming", data: response });

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
            this.logger?.error({ src: "Provider:OpenAIWhisper:send", error: error.toString(), data: message });
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
            this.logger?.error({ src: "Provider:OpenAIWhisper:Run", data: { messages, profile } });
        }
    }

    connect(profile) {
        return new Promise(async (resolve, reject) => {
            if (this.status === this.state.connected) {
                return resolve(this);
            }

            let url = profile.url || "wss://api.this.driver.com/v1/realtime";
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
                this.logger?.log({ src: "Provider:OpenAIWhisper:onError", error });
                reject(error);
            };

            this.ws.on("open", () => {
                this.status = this.state.connected;
                this.logger?.log({ src: "Provider:OpenAIWhisper:Connected" });
                resolve(this);
            });

            this.ws.on("message", this.onIncoming.bind(this));
        });
    }

    disconnect() {
        this.status = this.state.disconnected;
    }
}

export default OpenAIWhisper;