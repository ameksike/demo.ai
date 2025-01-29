import { WebSocketServer } from 'ws';
import { __dirname } from '../utils/polyfill.js';

const {
    WS_PORT = 8080,
} = process.env;

export class SimpleWebSocket {

    constructor(options) {
        this.logger = options?.logger || console;
    }

    start(options) {
        const { port = WS_PORT, routes, server } = options || {};
        const wss = new WebSocketServer(server ? { server } : { port });

        wss.on('connection', (ws, req) => {
            this.logger?.log({
                src: "server:WEB_Socket:Start",
                data: { url: `http://localhost:${port}`, port }
            });

            this.run({ route: 'connection', routes, req, res: ws });

            ws.on('error', error => this.run({ route: 'error', routes, req: { error }, res: ws }));

            ws.on("close", (code, reason) => this.run({ route: 'close', routes, req: { code, reason }, res: ws }));

            ws.on('message', async (data, isBinary) => {
                const message = isBinary ? data : data.toString();
                const inf = this.extract(!isBinary && message);
                this.run({
                    route: inf?.route,
                    routes,
                    req: { req, body: message, isBinary, data },
                    res: ws
                });
                this.run({
                    route: "*",
                    routes,
                    req: { req, body: message, isBinary, data },
                    res: ws
                });
            });
        });
    }

    async run(options) {
        const { route, routes, req, res } = options || {};
        try {
            if (!route) {
                return null;
            }
            const router = routes[route];
            const action = router?.action || router?.handler || router?.controller;
            if (action instanceof Function) {
                const response = await action(req, res);
                res?.send && response && typeof response === "string" && res.send(response);
            }
        } catch (error) {
            this.logger?.error({ src: "Server:WS:run", error: error?.message });
        }
    }

    extract(str) {
        try {
            return JSON.parse(str);
        }
        catch (_) {
            return null;
        }
    }

    uid(min = 10000, max = 99999) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    info(req) {
        return {
            remoteAddress: req?.socket?.remoteAddress,
            token: req?.headers["sec-websocket-protocol"]
        }
    }
}

export default new SimpleWebSocket();