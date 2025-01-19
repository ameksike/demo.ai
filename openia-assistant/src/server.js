import dotenv from "dotenv";
dotenv.config();

import * as wsServer from "./utils/server.ws.js";
import * as webServer from "./utils/server.web.js";
import { onMessage, router as chatRouter } from "./controllers/chat.js";

wsServer.start({
    port: process.env.WP_PORT || 8080,
    routes: {
        "/": { controller: onMessage }
    }
});

webServer.start({
    port: process.env.PORT || 3000,
    routes: {
        "/chat": { router: chatRouter }
    }
});