import express from 'express';
import { getFromMeta, path } from '../utils/polyfill.js';
import ioc from '../utils/locator.js';

/**
 * Default controller for WebSocket messages
 * @param {string} message 
 * @param {import('ws').WebSocket} ws 
 */
export async function onMessage(message, ws) {
    let tmp = message.split(">>>");
    let msg = tmp.length > 1 ? tmp[1] : tmp[0];
    let drv = tmp.length > 1 ? tmp[0].trim() : "llama";
    let provider = (await ioc.get(drv, "../services"))?.lib;
    let intsance = provider?.default || provider;
    let available = intsance.run instanceof Function;

    console.log({
        src: "Controller:Chat:onMessage",
        data: {
            available,
            provider: drv,
            message: msg,
            keyword: ">>>"
        }
    });

    let content = available && await intsance.run(msg);
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
