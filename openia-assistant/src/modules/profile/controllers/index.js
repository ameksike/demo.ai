import ioc from '../../../common/utils/locator.js';
import { Profile } from '../services/profile.js';

export class ProfileController {
    async list(req, res) {
        let names = await ioc.scan(
            ioc.pathTo("db"),
            { recursive: false, filter: 'directories', extract: 'name' }
        );
        let profiles = await Promise.all(names.map(name => (new Profile()).configure(name)));
        res.json({ data: profiles.filter(Boolean) })
    }

    async select(req, res) {
        let profile = req.params.id && await (new Profile()).configure(req.params.id);
        res.json(profile)
    }
}

export default new ProfileController();