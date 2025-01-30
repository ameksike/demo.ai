import { default as axios } from 'axios';
import { Connector } from "../../../common/plugin/connector.js";

class External extends Connector {
    /**
     * Tool Call Action
     * @link https://www.npmjs.com/package/axios
     */
    async run(options) {
        try {
            const {
                data = {},
                url = '/',
                method = 'get',
                headers = {}
            } = options;
            const response = await axios({
                url,
                data,
                method,
                headers: { ...headers },
                maxRate: [
                    100 * 1024, // 100KB/s upload limit,
                    100 * 1024  // 100KB/s download limit
                ]
            });
            this.logger?.log({ src: "Connector:External:send", data: response?.data });
            return response.data
        } catch (error) {
            this.logger?.error({ src: "Connector:External:send", error });
            return null;
        }
    };
}

export default External;