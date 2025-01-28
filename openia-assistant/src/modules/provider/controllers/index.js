import ioc from '../../../common/utils/locator.js';

export class ProviderController {
    async list(req, res) {
        let connectorNames = await ioc.getProviders();
        let connectors = await Promise.all(connectorNames.map(name => ioc.getProvider(name)));
        let content = await Promise.all(connectors.map(conn => conn.metadata));
        res.json({ data: content.filter(Boolean) })
    }

    async select(req, res) {
        let connector = req.params.id && await ioc.getProvider(req.params.id);
        res.json(await connector?.metadata)
    }
}

export default new ProviderController();