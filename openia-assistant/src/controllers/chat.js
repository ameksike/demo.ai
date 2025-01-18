import express from 'express';
import { getFromMeta, path } from '../utils/polyfill.js';

export function onMessage(message, ws) {
    // ws.send(`Received: ${message}`);
    return `Received: ${message}`;
}

function onGet(req, res) {
    res.sendFile(path.join(__dirname, '../views/chat.html'));
}

// router definition and export 
const { __dirname } = getFromMeta(import.meta);
const router = express.Router();
router.get('/', onGet);
export { router };
export default router;
