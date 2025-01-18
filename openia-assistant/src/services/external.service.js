import { default as axios } from 'axios';

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
        return response.data
    } catch (error) {
        console.error("Error executing task: ", error);
        return null;
    }
};
