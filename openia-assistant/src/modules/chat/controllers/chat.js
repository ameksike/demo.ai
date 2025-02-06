import express from 'express';
import { getFromMeta, path } from '../../../common/utils/polyfill.js';
import * as srvRouter from '../services/router.js';


/**
 * Default controller for WebSocket messages
 * @param {string} message 
 * @param {import('ws').WebSocket} ws 
 */
export async function onMessage(req, res) {
    let { available, provider, profile, message = req.body } = await srvRouter.extract(res.user);

    if (req.isBinary || message === 'REC-STOP') {
        message = srvRouter.gatherAudio(req, { salts: 0 });
        if (message) {
            srvRouter.saveAudio({
                route: `../../../db/${profile?.name}/${res.user.id}/audio`,
                format: "webm",
                role: "user",
                data: message
            });
        }
    }

    console.log({
        src: "Controller:Chat:onMessage",
        data: {
            profile: profile?.name,
            provider: {
                available,
                message: !!message,
                isBinary: req.isBinary,
                name: profile?.provider,
                name: profile.model,
            }
        }
    });

    if (!message || !available) {
        return null;
    }

    provider.onAnswer = (payload) => {
        if (payload.type === "audio") {
            res.send(payload.chunk);
            /*res.send(JSON.stringify({
                type: payload.type,
                data: payload.content
            }));*/
        } else {
            res.send(JSON.stringify({
                type: payload.type,
                data: payload.content
            }));
        }
    }

    provider.onAnswerDone = (payload) => {
        payload?.audio?.length && srvRouter.saveAudio({
            route: `../../../db/${profile?.name}/${res.user.id}/audio`,
            format: "wav",
            role: "asistant",
            data: payload?.audio,
        });

        console.log({
            src: "Controller:Chat:onAnswerDone",
            data: {
                usage: payload?.usage,
                text: payload?.text,
                audio: payload?.audio?.length
            }
        });
    }

    let content = await provider.run(message, profile);
    profile?.save();

    res.send(JSON.stringify({
        type: "text",
        data: content || "I don't have an answer for your question"
    }));
}

/**
 * Home page chat controller
 * @param {*} req 
 * @param {*} res 
 */
export function onGet(req, res) {
    const { __dirname } = getFromMeta(import.meta);
    res.sendFile(path.join(__dirname, '../views/chat.html'));
}

/**
 * Home page chat controller
 * @param {*} req 
 * @param {*} res 
 */
export function onMicro(req, res) {
    const { __dirname } = getFromMeta(import.meta);
    res.sendFile(path.join(__dirname, '../views/audio.html'));
}

/**
 * Export Router definition  
 */
const router = express.Router();
router.get('/', onGet);
router.get('/micro', onMicro);
export { router };
export default router;
