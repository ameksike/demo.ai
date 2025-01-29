import dotenv from "dotenv";
dotenv.config();

import wsServer from "./common/server/ws.js";
import * as webServer from "./common/server/web.js";
import { onMessage, router as chatRouter } from "./modules/chat/controllers/chat.js";
import providerRouter from "./modules/provider/routes/index.js";
import connectorRouter from "./modules/connector/routes/index.js";
import profileRouter from "./modules/profile/routes/index.js";
import KsCryp from 'kscryp';

wsServer.start({
    port: process.env.WP_PORT || 8080,
    routes: {
        "*": { handler: onMessage },
        "error": {
            handler: (req, res) => {
                console.log({
                    src: "Server:WebSocket:error",
                    data: res.user
                })
            }
        },
        "close": {
            handler: (req, res) => {
                console.log({
                    src: "Server:WebSocket:close",
                    data: res.user
                })
            }
        },
        "connection": {
            handler: (req, res) => {
                let info = wsServer.info(req);
                res.user = KsCryp.decode(KsCryp.decode(info.token, "base64"), "json");
                req.user = res.user;

                console.log({
                    src: "Server:WebSocket:connection",
                    data: res.user
                })
            }
        }
    }
});

webServer.start({
    port: process.env.PORT || 3000,
    routes: {
        "/chat": { router: chatRouter },
        "/api/v1/provider": { router: providerRouter },
        "/api/v1/connector": { router: connectorRouter },
        "/api/v1/profile": { router: profileRouter },
    }
});