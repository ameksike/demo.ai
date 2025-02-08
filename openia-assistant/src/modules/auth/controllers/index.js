import KsCryp from 'kscryp';

export class AuthController {
    async onConnection(req, res) {
        let token = req?.headers && req.headers["sec-websocket-protocol"];
        res.user = KsCryp.decode(KsCryp.decode(token, "base64"), "json");
        req.user = res.user;

        console.log({
            src: "Auth:Controller:connection",
            data: res.user
        })
    }

    async onDisconnection(req, res) {
        console.log({
            src: "Auth:Controller:onDisconnection",
            data: res.user
        })
    }

    async onError(req, res) {
        console.log({
            src: "Auth:Controller:onError",
            data: res.user,
            error: req.error
        })
    }
}

export default new AuthController();