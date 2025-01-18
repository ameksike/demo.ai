import express from 'express';
import { WebSocketServer } from 'ws';
import { __dirname, join } from './polyfill.js';

export function startWeb(options) {
    const port = options?.port || 3000;
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(join(__dirname, '../', 'views')));
    app.use('/public', express.static(join(__dirname, '../', '../', 'public')));

    for (let route of options?.routes) {
        app.use(route.path, route.router);
    }

    app.listen(port, () => {
        console.log(`Server is running on http://localhost: ${port}`);
        console.log(`Server routes: ${options?.routes.map(route => route.path).join(', ')}`);
    });
}

export function startWs(options) {
    const port = options?.port || 8080;
    const server = options?.server;
    const wss = new WebSocketServer(server ? { server } : { port });
    wss.on('connection', (ws) => {
        console.log(`Server is running on ws://localhost:${port}`);
        ws.on('message', async (data) => {
            const message = data.toString();
            try {
                const controller = options?.controller;
                if (controller instanceof Function) {
                    const response = await controller(message, ws);
                    response && ws.send(response);
                }
            } catch (error) {
                socket.send("Sorry, something went wrong.");
            }
        });
    });
}