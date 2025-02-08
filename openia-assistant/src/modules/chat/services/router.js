import ioc from '../../../common/utils/locator.js';
import { Profile } from '../../profile/services/profile.js';
import audioTool from "../../../common/driver/audio.js";

const state = {
    chunks: [],
    salts: 7
}


export function saveAudio(options) {
    return audioTool.save(options);
}

export function gatherAudio(req, options) {
    let { salts = state.salts, stopKey = "REC-STOP" } = options || {};
    if (!req.isBinary && req.body !== stopKey) {
        return null;
    }

    req.isBinary && state.chunks.push(req.body);

    if ((!salts || state.chunks.length < salts) && req.body !== stopKey) {
        console.log("chunks", state.chunks.length, salts);
        return null;
    }

    let tmp = state.chunks.length ? Buffer.concat(state.chunks) : req.body;
    state.chunks = [];

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
