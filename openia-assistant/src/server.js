import dotenv from "dotenv";
dotenv.config();

import wsServer from "./common/server/ws.js";
import * as webServer from "./common/server/web.js";
import { onMessage, router as chatRouter } from "./modules/chat/controllers/chat.js";
import providerRouter from "./modules/provider/routes/index.js";
import connectorRouter from "./modules/connector/routes/index.js";
import profileRouter from "./modules/profile/routes/index.js";
import authRouter from "./modules/auth/routes/index.js";


wsServer.start({
    port: process.env.WP_PORT || 8080,
    routes: {
        "*": { handler: onMessage },
        "error": authRouter.error,
        "disconnection": authRouter.disconnection,
        "connection": authRouter.connection
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