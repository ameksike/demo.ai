import dotenv from "dotenv";
dotenv.config();

import * as wsServer from "./common/server.ws.js";
import * as webServer from "./common/server.web.js";
import { onMessage, router as chatRouter } from "./modules/chat/controllers/chat.js";

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