import decodeAudio from 'audio-decode';
import fs from 'fs/promises';
import { getFromMeta, path as _path } from './polyfill.js';
const { __dirname } = getFromMeta(import.meta);

export class AudioTool {

    constructor(config) {
        const {
            logger = console,
        } = config || {};
        this.logger = logger;
    }

    isPCM16WAV(buffer) {
        // WAV header format specs
        const format = buffer.toString('ascii', 8, 12); // Expect "WAVE"
        const audioFormat = buffer.readUInt16LE(20); // Expect 1 (PCM)
        const bitDepth = buffer.readUInt16LE(34); // Expect 16 bits
        return format === 'WAVE' && audioFormat === 1 && bitDepth === 16;
    };

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
    base64Encode(float32Array, chunkSize = 0x8000) {
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
            this.logger?.error({ src: "Common:AudioTool:base64Encode", error });
            return null;
        }
    }

    async toBase64(input) {
        try {
            this.logger?.log({
                src: "Common:AudioTool:toBase64", data: {
                    isPCM16WAV: this.isPCM16WAV(input)
                }
            });
            const audioBuffer = await decodeAudio(input);
            const channelData = audioBuffer.getChannelData(0);
            return this.base64Encode(channelData);
        }
        catch (error) {
            this.logger?.error({ src: "Common:AudioTool:base64Encode", error });
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
        return Buffer.concat([buffer, tmp]);
    }
}

export default new AudioTool();

