import express from 'express';
import { getFromMeta, path } from '../../../common/polyfill.js';
import * as srvRouter from '../services/router.js';

/**
 * Default controller for WebSocket messages
 * @param {string} message 
 * @param {import('ws').WebSocket} ws 
 */
export async function onMessage(msg, ws) {
    const { available, provider, providerName, message, keyword } = await srvRouter.extract(msg)

    console.log({
        src: "Controller:Chat:onMessage",
        data: { available, providerName, message, keyword }
    });

    let content = available && await provider.run(message);
    ws.send(content ? content : "I don't have an answer for your question");
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
 * Export Router definition  
 */
const router = express.Router();
router.get('/', onGet);
export { router };
export default router;
