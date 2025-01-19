import express from 'express';
import { getFromMeta, path } from '../utils/polyfill.js';
import * as srvOpenIA from '../services/openia.service.js';
import * as locator from '../utils/locator.js';

/**
 * Default controller for WebSocket messages
 * @param {string} message 
 * @param {import('ws').WebSocket} ws 
 */
export async function onMessage(message, ws) {
    console.log(" >>>>> ", { message, ws });
    let { tasks, content } = await srvOpenIA.process(message);

    if (Array.isArray(tasks)) {
        let list = await Promise.all(tasks.map(task => locator.run(task)));
        content += ` >> ${JSON.stringify(list)}`
    }

    // const res1 = await srvOpenIA.assist(message);
    ws.send(content);
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
