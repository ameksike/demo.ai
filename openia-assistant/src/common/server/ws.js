import { WebSocketServer } from 'ws';
import { __dirname } from '../utils/polyfill.js';

const {
    WS_PORT = 8080,
} = process.env;

export function start(options) {
    const { port = WS_PORT, routes, server } = options || {};
    const wss = new WebSocketServer(server ? { server } : { port });

    wss.on('connection', (ws) => {

        console.log({
            src: "server:WEB_Socket:Start",
            data: { url: `http://localhost:${port}`, port }
        });

        ws.on('message', async (data) => {
            const message = data.toString();
            const req = extract(message)
            try {
                const router = routes && routes[req.route];
                const controller = router?.controller;
                if (controller instanceof Function) {
                    const response = await controller(message, ws);
                    response && typeof response === "string" && ws.send(response);
                }
            } catch (error) {
                ws.send("Sorry, something went wrong.");
            }
        });
    });
}

function extract(str) {
    try {
        return JSON.parse(str);
    }
    catch (_) {
        return { route: "/", body: str }
    }
}