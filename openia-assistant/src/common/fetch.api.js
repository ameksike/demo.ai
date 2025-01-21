export class FetchAPI {
    /**
     * POST method
     * @param {string} url 
     * @param {object} [data] 
     * @param {object} [headers] 
     * @returns {Promise<{status: Number, body: Object, error?: Error}>}
     */
    async post(url, data = {}, headers = {}) {
        try {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Connection': 'keep-alive',
                    ...headers
                },
                body: JSON.stringify(data),
            };
            const response = await fetch(url, options);
            const body = await response.json();
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
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', ...headers },
            });
            const body = await response.json();
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
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...headers },
                body: JSON.stringify(data),
            });
            const body = await response.json();
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
            const response = await fetch(url, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', ...headers },
            });
            const body = await response.json();
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