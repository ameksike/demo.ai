import KsCryp from 'kscryp';

export class FetchAPI {

    constructor(options) {
        this.url = options?.url;
        this.headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'VA',
            'Accept': '*/*',
            'Connection': 'keep-alive',
            ...options?.headers
        }
    }

    async getResponse(response) {
        const body = await response.text();
        return KsCryp.decode(body, "json");
    }

    /**
     * @description Get full URL with params  
     * @param {Object} options 
     * @returns {URL} url
     */
    getUrl(options) {
        let { url, query } = options || {};
        const uri = new URL(url);
        for (let key in query) {
            url.searchParams.append(key, query[key]);
        }
        return uri;
    }

    /**
     * POST method
     * @param {string} url 
     * @param {object} [data] 
     * @param {object} [headers] 
     * @returns {Promise<{status: Number, body: Object, error?: Error}>}
     */
    async post(url, data = {}, headers = {}) {
        try {
            url = url || this.url;
            const options = {
                method: 'POST',
                headers: { ...this.headers, ...headers },
                body: KsCryp.encode(data, "json"),
            };
            const response = await fetch(url, options);
            const body = await this.getResponse(response);
            if (!response.ok) {
                return {
                    body,
                    error: new Error(body?.message || (typeof body === "string" && body) || `Create action failed`),
                    status: response.status
                };
            }
            return { status: response.status, body };
        }
        catch (error) {
            return { error, status: 500 };
        }
    }

    /**
     * GET method
     * @param {string} url 
     * @param {object} headers 
     * @returns {Promise<{status: Number, body: Object, error?: Error}>}
     */
    async get(url, headers = {}) {
        try {
            url = url || this.url;
            const response = await fetch(url, {
                method: 'GET',
                headers: { ...this.headers, ...headers },
            });
            const body = await this.getResponse(response);
            if (!response.ok) {
                return {
                    body,
                    error: new Error(body?.message || (typeof body === "string" && body) || `Select action failed`),
                    status: response.status
                };
            }
            return { status: response.status, body };
        }
        catch (error) {
            return { error, status: 500 };
        }
    }

    /**
     * PUT method
     * @param {string} url 
     * @param {object} [data] 
     * @param {object} [headers] 
     * @returns {Promise<{status: Number, body: Object, error?: Error}>}
     */
    async put(url, data = {}, headers = {}) {
        try {
            url = url || this.url;
            const response = await fetch(url, {
                method: 'PUT',
                headers: { ...this.headers, ...headers },
                body: KsCryp.encode(data, "json"),
            });
            const body = await this.getResponse(response);
            if (!response.ok) {
                return {
                    body,
                    error: new Error(body?.message || (typeof body === "string" && body) || `Update action failed`),
                    status: response.status
                };
            }
            return { status: response.status, body };
        }
        catch (error) {
            return { error, status: 500 };
        }
    }

    /**
     * DELETE method
     * @param {string} url 
     * @param {object} [headers] 
     * @returns {Promise<{status: Number, body: Object, error?: Error}>}
     */
    async delete(url, headers = {}) {
        try {
            url = url || this.url;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: { ...this.headers, ...headers },
            });
            const body = await this.getResponse(response);
            if (!response.ok) {
                return {
                    body,
                    error: new Error(body?.message || (typeof body === "string" && body) || `Delete action failed`),
                    status: response.status
                };
            }
            return { status: response.status, body };
        }
        catch (error) {
            return { error, status: 500 };
        }
    }
}

export default new FetchAPI();