import express from 'express';
import { __dirname, join } from '../utils/polyfill.js';

const {
    PORT = 3000,
    WWW_PATH = '../../../public',
    WWW_ROUTE = '/public'
} = process.env;

export function start(options) {
    const { port = PORT, routes } = options || {};
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(WWW_ROUTE, express.static(join(__dirname, WWW_PATH)));

    if (routes) {
        for (let route in routes) {
            app.use(route, routes[route].router || routes[route].controller);
        }
    }

    app.listen(port, () => {
        console.log({
            src: "server:WEB:Start",
            data: { url: `http://localhost:${port}`, port, routes: Object.keys(routes || {}) }
        });
    });
}
