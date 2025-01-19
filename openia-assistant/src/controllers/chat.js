import express from 'express';
import { getFromMeta, path } from '../utils/polyfill.js';
import srvOpenIA from '../services/openia.completions.js';

/**
 * Default controller for WebSocket messages
 * @param {string} message 
 * @param {import('ws').WebSocket} ws 
 */
export async function onMessage(message, ws) {
    console.log(" >>>>> ", { message, ws });
    let content = await srvOpenIA.run(message);
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
