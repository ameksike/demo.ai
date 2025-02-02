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
        let { file = "tmp", path = __dirname, format = "webm", data } = options || {};
        if (!Buffer.isBuffer(data) || data.length === 0) {
            this.logger?.error("❌ Invalid buffer: Cannot save empty data.");
            return;
        }
        return fs.writeFile(_path.resolve(path, `${file}-${this.getUiD()}.${format}`), data);
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

            console.log("🟢 Buffer recibido con tamaño:", webmBuffer.length);
            console.log("🔍 Primeros bytes:", webmBuffer.slice(0, 20));
            console.log("🟢 Recibido buffer válido, procesando...");

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
                .audioFrequency(16000) // Ajustar a 16kHz para OpenAI
                // .format("wav") // Salida en WAV
                .outputOptions(["-f wav"]) // Forzar WAV sin compresión

                .on("start", (cmd) => console.log("🚀 FFmpeg iniciado:", cmd))
                .on("error", (err) => reject(new Error(`❌ FFmpeg error: ${err.message}`)))
                .on("end", () => {
                    console.log("✅ FFmpeg terminó con éxito.");
                    resolve(Buffer.concat(pcmChunks));
                })
                .pipe(outputStream, { end: true });

            // Capturar los datos de salida
            outputStream.on("data", (chunk) => pcmChunks.push(chunk));
            // Manejar cierre del stream correctamente
            outputStream.on("close", () => console.log("🔄 Stream de salida cerrado"));
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

    writeWavHeader(outputStream, options) {
        const {
            sampleRate,
            numChannels = 1, // Mono
            bitDepth = 16,
            dataSize = 48000 // Default MediaRecorder sample rate
        } = options || {}
        const header = Buffer.alloc(44);
        header.write('RIFF', 0, 4, 'ascii'); // Chunk ID
        header.writeUInt32LE(36 + dataSize, 4); // Chunk size
        header.write('WAVE', 8, 4, 'ascii'); // Format
        header.write('fmt ', 12, 4, 'ascii'); // Sub-chunk 1 ID
        header.writeUInt32LE(16, 16); // Sub-chunk 1 size (16 for PCM)
        header.writeUInt16LE(1, 20); // Audio format (1 for PCM)
        header.writeUInt16LE(numChannels, 22); // Number of channels
        header.writeUInt32LE(sampleRate, 24); // Sample rate
        header.writeUInt32LE(sampleRate * numChannels * bitDepth / 8, 28); // Byte rate
        header.writeUInt16LE(numChannels * bitDepth / 8, 32); // Block align
        header.writeUInt16LE(bitDepth, 34); // Bits per sample
        header.write('data', 36, 4, 'ascii'); // Sub-chunk 2 ID
        header.writeUInt32LE(dataSize, 40); // Sub-chunk 2 size
        outputStream.write(header);
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
        return buffer.buffer;
    }
}

export default new AudioTool();

