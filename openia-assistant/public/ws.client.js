export class WsClient {
    constructor(options = null) {
        this.logger = options?.logger || console;
        this.socket = null;
        this.configure(options);
    }

    get isConnected() {
        return this.socket?.readyState === WebSocket.OPEN;
    }

    configure(options) {
        options?.url && (this.url = options?.url);
        options?.onToken instanceof Function && (this.onToken = options?.onToken);
        options?.onMessage instanceof Function && (this.onMessage = options?.onMessage);
        options?.onConnected instanceof Function && (this.onConnected = options?.onConnected);
        options?.onClose instanceof Function && (this.onClose = options?.onClose);
        options?.onError instanceof Function && (this.onError = options?.onError);
        return this;
    }

    onMessage(event) {
        this.logger.log({ src: "WsClient:onMessage", data: event.data })
    }

    onClose(event) {
        this.logger?.log({ src: "WsClient:onClose", data: event.reason });
        this.socket = null;
    }

    onToken(data) {
        return data;
    }

    onError(error) {
        this.logger?.error({ src: "WsClient:onError", error: error?.message });
        this.socket = null;
    }

    onConnected(options) {
        this.logger?.log({ src: "WsClient:onConnected", data: options });
    }

    connect(options) {
        try {
            this.configure(options);
            if (this.isConnected) {
                this.logger?.error({ src: "WsClient:connect", data: "WebSocket already connected" });
                return;
            }
            let protocols = Array.isArray(options?.protocols) ? options.protocols : [];
            if (options?.token) {
                protocols.push(this.onToken(options?.token));
            }
            this.socket = new WebSocket(this.url, protocols);
            this.socket.onopen = () => this.onConnected({ url: this.url, protocols });
            this.socket.onerror = this.onError.bind(this);
            this.socket.onmessage = this.onMessage.bind(this);
            this.socket.onclose = this.onClose.bind(this);
        }
        catch (error) {
            this.onError(error);
        }
    }

    disconnect() {
        try {
            this.socket.close();
            this.logger?.error({ src: "WsClient:disconnect", data: "Closing WebSocket connection..." });
        }
        catch (error) {
            this.logger?.error({ src: "WsClient:disconnect", error: error.message });
        }
    }

    send(message) {
        if (this.isConnected) {
            this.socket.send(message);
            this.logger?.error({ src: "WsClient:send", data: "Message sent" });
        } else {
            this.logger?.error({ src: "WsClient:send", error: "WebSocket is not connected." });
        }
    }
}