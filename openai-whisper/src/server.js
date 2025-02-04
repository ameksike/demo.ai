// server.js
import express from 'express';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { OpenAI } from 'openai';

import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';
import { Readable } from 'stream';
import { Buffer } from 'buffer';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Reemplaza con tu clave de API de OpenAI
});

// Crear un servidor WebSocket
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    let audioBuffer = [];
    let conversationHistory = []; // Almacenar el historial de la conversación

    ws.on('message', async (message) => {
        if (message instanceof Buffer) {
            audioBuffer.push(message); // Acumular los chunks de audio en memoria
        }
    });

    ws.on('close', async () => {
        console.log('WebSocket connection closed');
        if (!audioBuffer?.length) {
            console.log('There is no audio Buffer');
            return null;
        }

        const combinedBuffer = Buffer.concat(audioBuffer); // Combinar todos los chunks en un solo Buffer

        try {

            // const tempFilePath = path.join('./', 'temp_audio.wav');
            // fs.writeFileSync(tempFilePath, combinedBuffer);

            const audioStream = new Readable({
                read() {
                    this.push(combinedBuffer); // Enviar el Buffer al stream
                    this.push(null); // Indicar el final del stream
                },
            });

            // Transcribir el audio del usuario
            const transcription = await openai.audio.transcriptions.create({
                file: audioStream,
                model: "whisper-1",
                response_format: "text",
            });

            console.log('Transcripción del usuario:', transcription.text);

            // Enviar la transcripción al cliente
            ws.send(JSON.stringify({
                type: 'transcription',
                text: transcription.text,
            }));

            // Agregar la transcripción al historial de la conversación
            conversationHistory.push({ role: 'user', content: transcription?.text || "hola" });

            // Generar una respuesta del asistente
            const assistantResponse = await openai.chat.completions.create({
                model: 'gpt-4o-mini', // Usar GPT-4 para generar respuestas
                messages: conversationHistory,
            });

            const assistantText = assistantResponse.choices[0].message.content;
            console.log('Respuesta del asistente:', assistantText);

            // Agregar la respuesta del asistente al historial de la conversación
            conversationHistory.push({ role: 'assistant', content: assistantText });

            // Convertir la respuesta del asistente en audio
            const audioResponse = await openai.audio.speech.create({
                model: "tts-1",
                input: assistantText,
                voice: 'alloy',
                response_format: 'mp3',
            });

            const audioBufferResponse = await audioResponse.arrayBuffer();

            // Enviar la respuesta del asistente al cliente
            ws.send(JSON.stringify({
                type: 'assistant',
                text: assistantText,
                audio: Buffer.from(audioBufferResponse),
            }));
        } catch (error) {
            console.error('Error processing audio with OpenAI:', error);
            ws.send(JSON.stringify({ error: 'Failed to process audio' }));
        }

    });
});

app.use("/", express.static(path.join(__dirname, "client")));

app.listen(3000, () => {
    console.log('HTTP server is running on port 3000');
});