import express from 'express';
import { getFromMeta, path } from '../utils/polyfill.js';
import * as srvOpenIA from '../services/openiaService.js';

/**
 * Default controller for WebSocket messages
 * @param {string} message 
 * @param {import('ws').WebSocket} ws 
 */
export async function onMessage(message, ws) {
    console.log(`Received: ${message}`, ws.request);
    const res = await srvOpenIA.process(message);
    ws.send(res.content);
}

/**
 * Home page chat controller
 * @param {*} req 
 * @param {*} res 
 */
function onGet(req, res) {
    res.sendFile(path.join(__dirname, '../views/chat.html'));
}

// router definition and export 
const { __dirname } = getFromMeta(import.meta);
const router = express.Router();
router.get('/', onGet);
export { router };
export default router;
