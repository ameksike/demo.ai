import ioc from '../../../common/utils/locator.js';
import { Profile } from '../../profile/services/profile.js';
import KsCryp from 'kscryp';

const keyword = ">>>";

export async function extract(message) {
    try {
        let tmp = message.split(keyword);
        let msg = tmp[0].trim();
        let meta = tmp.length > 1 ? KsCryp.decode(tmp[1].trim(), "json") : "10001";
        meta = typeof meta === "string" ? { name: meta } : meta;

        let profile = await (new Profile()).configure(meta);
        let provider = await ioc.getProvider(profile?.provider);
        let available = provider.run instanceof Function;

        return {
            keyword,
            available,
            provider,
            message: msg,
            profile
        };
    }
    catch (error) {
        console.log({
            src: "Chat:Service:Router:extract",
            error
        });
    }
}
