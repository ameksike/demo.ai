import controller from "../controllers/index.js";

const router = {
    "error": {
        handler: controller.onError.bind(controller)
    },
    "disconnection": {
        handler: controller.onDisconnection.bind(controller)
    },
    "connection": {
        handler: controller.onConnection.bind(controller)
    }
}

export default router;