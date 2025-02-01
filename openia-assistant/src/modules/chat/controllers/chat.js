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
        message = srvRouter.gatherAudio(req);
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

    let content = await provider.run(message, profile, (payload) => {
        payload?.content && res.send(payload.content || payload.chunk);
    });
    profile?.save();
    res.send(content ? content : "I don't have an answer for your question");
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
