const atob = globalThis.atob;
const btoa = globalThis.btoa;

/**
 * Basic utilities for data manipulation
 * @class
 */
export class DataConverter {
    /**
     * Checks if the given data is a Blob.
     * @param {*} data - The data to check.
     * @returns {boolean} True if data is a Blob, false otherwise.
     */
    static isBlob(data) {
        return data instanceof Blob;
    }

    /**
     * Checks if the given string is a valid Base64 encoded string.
     * @param {string} data - The string to check.
     * @returns {boolean} True if the string is Base64 encoded, false otherwise.
     */
    static isBase64(data) {
        return typeof data === "string" && /^[A-Za-z0-9+/]+={0,2}$/.test(data);
    }

    /**
     * Checks if the given data is an ArrayBuffer.
     * @param {*} data - The data to check.
     * @returns {boolean} True if data is an ArrayBuffer, false otherwise.
     */
    static isArrayBuffer(data) {
        return data instanceof ArrayBuffer;
    }

    /**
     * Checks if the given data is an Float32Array.
     * @param {*} data - The data to check.
     * @returns {boolean} True if data is an ArrayBuffer, false otherwise.
     */
    static isFloat32Array() {
        return data instanceof Float32Array
    }

    /**
     * Checks if the given data is an Int16Array.
     * @param {*} data - The data to check.
     * @returns {boolean} True if data is an ArrayBuffer, false otherwise.
     */
    static isInt16Array() {
        return data instanceof Int16Array
    }

    /**
     * Converts a Blob to an ArrayBuffer.
     * @param {Blob} blob - The Blob to convert.
     * @returns {Promise<ArrayBuffer>} A promise that resolves to an ArrayBuffer.
     * @throws {Error} If the input is not a valid Blob.
     */
    static async blobToArrayBuffer(blob) {
        if (!this.isBlob(blob)) throw new Error("Invalid input: Expected a Blob.");
        return await blob.arrayBuffer();
    }

    /**
     * Converts a Blob to a Base64-encoded string.
     * @param {Blob} blob - The Blob to convert.
     * @returns {Promise<string>} A promise that resolves to a Base64 string.
     * @throws {Error} If the input is not a valid Blob.
     */
    static async blobToBase64(blob) {
        if (!this.isBlob(blob)) throw new Error("Invalid input: Expected a Blob.");
        const buffer = await blob.arrayBuffer();
        return btoa(String.fromCharCode(...new Uint8Array(buffer)));
    }

    /**
     * Converts a Base64-encoded string to a Blob.
     * @param {string} base64 - The Base64 string to convert.
     * @param {string} [mimeType="application/octet-stream"] - The MIME type of the resulting Blob.
     * @returns {Blob} A Blob representation of the Base64 string.
     * @throws {Error} If the input is not a valid Base64 string.
     */
    static base64ToBlob(base64, mimeType = "application/octet-stream") {
        if (!this.isBase64(base64)) throw new Error("Invalid input: Expected a Base64 string.");
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return new Blob([bytes], { type: mimeType });
    }

    /**
     * Converts an ArrayBuffer to a Blob.
     * @param {ArrayBuffer} arrayBuffer - The ArrayBuffer to convert.
     * @param {string} [mimeType="application/octet-stream"] - The MIME type of the resulting Blob.
     * @returns {Blob} A Blob representation of the ArrayBuffer.
     * @throws {Error} If the input is not a valid ArrayBuffer.
     */
    static arrayBufferToBlob(arrayBuffer, mimeType = "application/octet-stream") {
        if (!this.isArrayBuffer(arrayBuffer)) throw new Error("Invalid input: Expected an ArrayBuffer.");
        return new Blob([arrayBuffer], { type: mimeType });
    }

    /**
     * Converts a Float32Array to an ArrayBuffer.
     * @param {Float32Array} float32Array - The Float32Array to convert.
     * @returns {ArrayBuffer} The resulting ArrayBuffer.
     * @throws {Error} If the input is not a Float32Array.
     */
    static float32ArrayToArrayBuffer(float32Array) {
        if (!(float32Array instanceof Float32Array)) {
            throw new Error("Invalid input: Expected a Float32Array.");
        }
        return float32Array.buffer;
    }

    /**
     * Converts an Int16Array to an ArrayBuffer.
     * @param {Int16Array} int16Array - The Int16Array to convert.
     * @returns {ArrayBuffer} The resulting ArrayBuffer.
     * @throws {Error} If the input is not an Int16Array.
     */
    static int16ArrayToArrayBuffer(int16Array) {
        if (!(int16Array instanceof Int16Array)) {
            throw new Error("Invalid input: Expected an Int16Array.");
        }
        return int16Array.buffer;
    }

    /**
     * Converts Float32Array of amplitude data to ArrayBuffer in Int16Array format
     * @param {Float32Array} float32Array
     * @returns {ArrayBuffer}
     */
    static floatTo16BitPCM(float32Array) {
        const buffer = new ArrayBuffer(float32Array.length * 2);
        const view = new DataView(buffer);
        let offset = 0;
        for (let i = 0; i < float32Array.length; i++, offset += 2) {
            let s = Math.max(-1, Math.min(1, float32Array[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        }
        return buffer;
    }

    /**
     * Converts a base64 string to an ArrayBuffer
     * @param {string} base64
     * @returns {ArrayBuffer}
     */
    static base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Converts an ArrayBuffer, Int16Array or Float32Array to a base64 string
     * @param {ArrayBuffer|Int16Array|Float32Array} arrayBuffer
     * @returns {string}
     */
    static arrayBufferToBase64(arrayBuffer) {
        if (arrayBuffer instanceof Float32Array) {
            arrayBuffer = this.floatTo16BitPCM(arrayBuffer);
        } else if (arrayBuffer instanceof Int16Array) {
            arrayBuffer = arrayBuffer.buffer;
        }
        let binary = '';
        let bytes = new Uint8Array(arrayBuffer);
        const chunkSize = 0x8000; // 32KB chunk size
        for (let i = 0; i < bytes.length; i += chunkSize) {
            let chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode.apply(null, chunk);
        }
        return btoa(binary);
    }

    /**
     * Merge two Int16Arrays from Int16Arrays or ArrayBuffers
     * @param {ArrayBuffer|Int16Array} left
     * @param {ArrayBuffer|Int16Array} right
     * @returns {Int16Array}
     */
    static mergeInt16Arrays(left, right) {
        if (left instanceof ArrayBuffer) {
            left = new Int16Array(left);
        }
        if (right instanceof ArrayBuffer) {
            right = new Int16Array(right);
        }
        if (!(left instanceof Int16Array) || !(right instanceof Int16Array)) {
            throw new Error(`Both items must be Int16Array`);
        }
        const newValues = new Int16Array(left.length + right.length);
        for (let i = 0; i < left.length; i++) {
            newValues[i] = left[i];
        }
        for (let j = 0; j < right.length; j++) {
            newValues[left.length + j] = right[j];
        }
        return newValues;
    }

    /**
     * Generates an id to send with events and messages
     * @param {string} prefix
     * @param {number} [length]
     * @returns {string}
     */
    static generateId(prefix, length = 21) {
        // base58; non-repeating chars
        const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        const str = Array(length - prefix.length)
            .fill(0)
            .map((_) => chars[Math.floor(Math.random() * chars.length)])
            .join('');
        return `${prefix}${str}`;
    }

    async blobToPCM(blob) {
        const arrayBuffer = await blob.arrayBuffer();
        const audioCtx = new AudioContext({ sampleRate: 16000 }); // OpenAI espera 16kHz
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        const rawData = audioBuffer.getChannelData(0);

        // Convertir a Int16Array
        const pcmData = new Int16Array(rawData.length);
        for (let i = 0; i < rawData.length; i++) {
            pcmData[i] = rawData[i] * 32767; // Normalizar a Int16
        }
        return pcmData;
    }


    /**
     * Agrega el reproductor de audio al DOM con el archivo generado
     */
    static createWavBlob(recordedChunks, sampleRate) {
        if (recordedChunks.length === 0) return null;

        // Unir todos los fragmentos en un solo array
        const totalLength = recordedChunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const audioData = new Int16Array(totalLength);
        let offset = 0;
        for (const chunk of recordedChunks) {
            audioData.set(chunk, offset);
            offset += chunk.length;
        }

        // Crear el archivo WAV
        return this.encodeWav(audioData, sampleRate);
    }

    /**
     * Codifica los datos de audio en formato WAV válido
     */
    static encodeWav(samples, sampleRate) {
        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);

        // RIFF Chunk
        this.writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + samples.length * 2, true);
        this.writeString(view, 8, 'WAVE');

        // fmt Subchunk
        this.writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM format
        view.setUint16(22, 1, true); // Mono
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);

        // data Subchunk
        this.writeString(view, 36, 'data');
        view.setUint32(40, samples.length * 2, true);

        // Escribir los datos de audio
        let offset = 44;
        for (let i = 0; i < samples.length; i++, offset += 2) {
            view.setInt16(offset, samples[i], true);
        }

        return new Blob([buffer], { type: "audio/wav" });
    }

    /**
     * Función auxiliar para escribir strings en el buffer
     */
    static writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
}
