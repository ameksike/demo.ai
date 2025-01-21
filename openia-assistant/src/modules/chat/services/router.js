import ioc from '../../../common/locator.js';
import KsCryp from 'kscryp';

const keyword = ">>>";

export async function extract(message) {
    try {
        let tmp = message.split(keyword);
        let msg = tmp[0].trim();
        let meta = tmp.length > 1 ? KsCryp.decode(tmp[1].trim(), "json") : "llama";
        meta = typeof meta === "string" ? { provider: meta } : meta;

        let provider = await ioc.getProvider(meta.provider);
        let available = provider.run instanceof Function;

        return {
            keyword,
            available,
            provider,
            providerName: meta.provider,
            message: msg
        };
    }
    catch (error) {
        console.log({
            src: "Chat:Service:Router:extract",
            error
        });
    }
}
