import decodeAudio from 'audio-decode';
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";

import fs from 'fs/promises';
import { getFromMeta, path as _path } from '../utils/polyfill.js';
const { __dirname } = getFromMeta(import.meta);

export class AudioTool {

    constructor(config) {
        const {
            logger = console,
        } = config || {};
        this.logger = logger;
    }

    getUiD(min = 100, max = 999) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    save(options) {
        let { file, route = "tmp", path = __dirname, format = "webm", data, role = "user" } = options || {};
        if (!Buffer.isBuffer(data) || data.length === 0) {
            this.logger?.error("❌ Invalid buffer: Cannot save empty data.");
            return;
        }
        file = file || _path.resolve(path, `${route}/${role}-${this.getUiD()}.${format}`);
        this.logger?.log({
            src: "AudioTool:save",
            data: { route }
        });
        switch (format) {
            case "wav":
                const pcmBuffer = data;
                const wavHeader = this.wavHeader({ data });
                const wavBuffer = Buffer.concat([wavHeader, pcmBuffer]);
                return fs.writeFile(file, wavBuffer);

            default:
                return fs.writeFile(file, data);
        }
    }

    isPCM16WAV(buffer) {
        // WAV header format specs
        const format = buffer.toString('ascii', 8, 12); // Expect "WAVE"
        const audioFormat = buffer.readUInt16LE(20); // Expect 1 (PCM)
        const bitDepth = buffer.readUInt16LE(34); // Expect 16 bits
        return format === 'WAVE' && audioFormat === 1 && bitDepth === 16;
    };

    async webMtoPCM16(webmBuffer) {
        return new Promise((resolve, reject) => {
            if (!Buffer.isBuffer(webmBuffer) || webmBuffer.length === 0) {
                return reject(new Error("❌ Invalid input: Buffer is empty"));
            }

            this.logger?.log({
                src: "AudioTool:webMtoPCM16",
                message: "🟢 Buffer recibido con tamaño: " + webmBuffer.length
            })
            this.logger?.log({
                src: "AudioTool:webMtoPCM16",
                message: "🔍 Primeros bytes:" + String(webmBuffer.slice(0, 20))
            })
            this.logger?.log({
                src: "AudioTool:webMtoPCM16",
                message: "🟢 Recibido buffer válido, procesando..."
            })

            const inputStream = new PassThrough();
            const outputStream = new PassThrough();
            const pcmChunks = [];

            // Escribir datos en el inputStream
            inputStream.end(webmBuffer);

            ffmpeg()
                .input(inputStream)
                .inputFormat("webm") // Asegurar que es WebM
                .audioCodec("pcm_s16le") // Convertir a PCM16
                .audioChannels(1) // Forzar 1 canal (evita errores)
                .audioFrequency(24000) // Ajustar a 16kHz para OpenAI   16000
                // .format("wav") // Salida en WAV
                .outputOptions(["-f wav"]) // Forzar WAV sin compresión

                .on("error", (err) => reject(new Error(`❌ FFmpeg error: ${err.message}`)))
                .on("start", (cmd) => this.logger?.log({
                    src: "AudioTool:webMtoPCM16",
                    message: "🚀 FFmpeg iniciado:",
                    data: cmd
                }))
                .on("end", () => {
                    this.logger?.log({
                        src: "AudioTool:webMtoPCM16",
                        message: "✅ FFmpeg terminó con éxito."
                    });
                    resolve(Buffer.concat(pcmChunks));
                })
                .pipe(outputStream, { end: true });

            // Capturar los datos de salida
            outputStream.on("data", (chunk) => pcmChunks.push(chunk));
            // Manejar cierre del stream correctamente
            outputStream.on("close", () => this.logger?.log({
                src: "AudioTool:webMtoPCM16",
                message: "🔄 Stream de salida cerrado"
            }));
        });
    }

    /**
     * @description Converts Float32Array of audio data to PCM16 ArrayBuffer
     * @param {*} float32Array 
     * @returns 
     */
    floatTo16BitPCM(float32Array) {
        try {
            let buffer = new ArrayBuffer(float32Array.length * 2);
            let view = new DataView(buffer);
            let offset = 0;
            this.logger?.log({ src: "Common:AudioTool:floatTo16BitPCM", data: { length: float32Array.length } });
            for (let i = 0; i < float32Array.length; i++, offset += 2) {
                // Clamp between -1 and 1
                let s = Math.max(-1, Math.min(1, float32Array[i]));
                // PCM16 encoding
                view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
            }
            return buffer;
        }
        catch (error) {
            this.logger?.error({ src: "Common:AudioTool:floatTo16BitPCM", error });
            return null;
        }
    }

    /**
     * @description Converts a Float32Array to base64-encoded PCM16 data
     * @param {*} float32Array 
     * @param {*} chunkSize 32KB chunk size
     * @returns 
     */
    toBase64(float32Array, chunkSize = 0x8000) {
        try {
            let arrayBuffer = this.floatTo16BitPCM(float32Array);
            let binary = '';
            let bytes = new Uint8Array(arrayBuffer);
            this.logger?.log({ src: "Common:AudioTool:floatTo16BitPCM", data: { length: bytes.length } });
            for (let i = 0; i < bytes.length; i += chunkSize) {
                let chunk = bytes.subarray(i, i + chunkSize);
                binary += String.fromCharCode.apply(null, chunk);
            }
            return btoa(binary);
        }
        catch (error) {
            this.logger?.error({ src: "Common:AudioTool:toBase64", error });
            return null;
        }
    }

    async webmToBase64(input) {
        try {
            const channelData = await this.webMtoPCM16(input);
            return this.toBase64(channelData);
        }
        catch (error) {
            this.logger?.error({ src: "Common:AudioTool:webmToBase64", error });
            return null;
        }
    }

    async wavToBase64(input) {
        try {
            this.logger?.log({
                src: "Common:AudioTool:toBase64", data: {
                    isPCM16WAV: this.isPCM16WAV(input)
                }
            });
            const audioBuffer = await decodeAudio(input);
            const channelData = audioBuffer.getChannelData(0);
            return this.toBase64(channelData);
        }
        catch (error) {
            this.logger?.error({ src: "Common:AudioTool:wavToBase64", error });
            return null;
        }
    }

    /**
     * @description load audio content
     * @param {string} name 
     * @param {string} [path] 
     * @param {string} [ext=".json"] 
     * @returns {*} content
     */
    async load(name = "content", path = "", ext = ".wav") {
        try {
            const filePath = _path.resolve(__dirname, "../../", path, name + ext);
            return await fs.readFile(filePath);
        } catch (error) {
            this.logger?.error({
                src: "AudioTool:load",
                error,
                data: { name, path, ext }
            });
            return null;
        }
    }

    getChunk(chunk = null) {
        return typeof chunk == "string" && chunk ? Buffer.from(chunk, 'base64') : chunk;
    }

    gather(options = null) {
        let { chunk, buffer = Buffer.alloc(0) } = options || {};
        chunk = this.getChunk(chunk);
        if (!chunk) {
            return buffer;
        }
        return Buffer.concat([buffer, chunk]);
    }

    wavHeader(options) {
        let {
            sampleRate = 24000,
            numChannels = 1, // Mono
            chunkSalt = 36,
            bitDepth = 16,
            dataSize = 48000, // Default MediaRecorder sample rate,
            data
        } = options || {}

        dataSize = data?.length || dataSize;
        let byteRate = sampleRate * numChannels * 2; // 16-bit (2 bytes per sample)
        let chunkSize = chunkSalt + dataSize;
        let wavHeader = Buffer.alloc(44);
        wavHeader.write("RIFF", 0); // ChunkID
        wavHeader.writeUInt32LE(chunkSize, 4); // ChunkSize
        wavHeader.write("WAVE", 8); // Format
        wavHeader.write("fmt ", 12); // Subchunk1ID
        wavHeader.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
        wavHeader.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
        wavHeader.writeUInt16LE(numChannels, 22); // NumChannels
        wavHeader.writeUInt32LE(sampleRate, 24); // SampleRate
        wavHeader.writeUInt32LE(byteRate, 28); // ByteRate
        wavHeader.writeUInt16LE(numChannels * 2, 32); // BlockAlign
        wavHeader.writeUInt16LE(16, 34); // BitsPerSample
        wavHeader.write("data", 36); // Subchunk2ID
        wavHeader.writeUInt32LE(dataSize, 40); // Subchunk2Size
        return wavHeader;
    }

    /**
     * Convert ArrayBuffer → Buffer
     * @param {ArrayBuffer} arrayBuffer 
     * @returns {Buffer}
     */
    arrayBufferToBuffer(arrayBuffer) {
        return Buffer.from(arrayBuffer);
    }

    /**
     * Convert Buffer → ArrayBuffer
     * @param {Buffer} buffer 
     * @returns {ArrayBuffer} 
     */
    bufferToArrayBuffer(buffer) {
        return buffer?.buffer;
    }
}

export default new AudioTool();

