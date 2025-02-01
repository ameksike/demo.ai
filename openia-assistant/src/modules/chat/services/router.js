import ioc from '../../../common/utils/locator.js';
import { Profile } from '../../profile/services/profile.js';
import speackerTool from "../../../common/driver/speacker.js";

const state = {
    chunks: [],
    salts: 7
}

export function gatherAudio(req) {
    if (!req.isBinary && req.body !== "REC-STOP") {
        return null;
    }

    req.isBinary && state.chunks.push(req.body);

    if (state.salts && state.chunks.length < state.salts && req.body !== "REC-STOP") {
        return null;
    }

    let tmp = state.salts ? Buffer.concat(state.chunks) : req.body;
    state.chunks = [];

    speackerTool.talk(tmp).stop();
    return tmp;
}

export async function extract(user) {
    try {
        let profile = await (new Profile()).configure({ ...user.profile, userId: user.id });
        let provider = await ioc.getProvider(profile?.provider);
        let available = provider.run instanceof Function;

        return {
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
