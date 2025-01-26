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

    floatTo16BitPCM(float32Array) {
        try {
            let buffer = new ArrayBuffer(float32Array.length * 2);
            let view = new DataView(buffer);
            let offset = 0;
            this.logger?.log({ src: "Common:AudioTool:floatTo16BitPCM", data: { length: float32Array.length } });
            for (let i = 0; i < float32Array.length; i++, offset += 2) {
                let s = Math.max(-1, Math.min(1, float32Array[i]));
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
     * 
     * @param {*} float32Array 
     * @param {*} chunkSize 32KB chunk size
     * @returns 
     */
    base64Encode(float32Array, chunkSize = 0x8000) {
        try {
            const arrayBuffer = this.floatTo16BitPCM(float32Array);
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

