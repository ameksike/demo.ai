import dotenv from "dotenv";
import { startWeb, startWs } from "./utils/server.js";
import { onMessage, router as chatRouter  } from "./controllers/chat.js";

dotenv.config();

startWs({
    port: process.env.WP_PORT || 8080,
    controller: onMessage
});

startWeb({
    port: process.env.PORT || 3000,
    routes: [
        { path: "/chat", router: chatRouter }
    ]
});