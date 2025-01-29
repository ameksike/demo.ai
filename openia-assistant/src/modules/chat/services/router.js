import ioc from '../../../common/utils/locator.js';
import { Profile } from '../../profile/services/profile.js';
import KsCryp from 'kscryp';

const keyword = ">>>";

export async function extract(user) {
    try {
        let profile = await (new Profile()).configure({ ...user.profile, userId: user.id });
        let provider = await ioc.getProvider(profile?.provider);
        let available = provider.run instanceof Function;

        return {
            keyword,
            available,
            provider,
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
