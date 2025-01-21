import { default as axios } from 'axios';

/**
 * @link https://www.npmjs.com/package/axios
 */
export const run = async (options) => {
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
        console.log({
            src: "Plugin:External:send",
            data: response.data
        });
        return response.data
    } catch (error) {
        console.log({ src: "Plugin:External:send", error });
        return null;
    }
};
