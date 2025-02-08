import ioc from '../../../common/utils/locator.js';

export class ConnectorController {
    async list(req, res) {
        let connectorNames = await ioc.getConnectors();
        let connectors = await Promise.all(connectorNames.map(name => ioc.getConnector(name)));
        let content = await Promise.all(connectors.map(conn => conn.metadata));
        res.json({ data: content.filter(Boolean) })
    }

    async select(req, res) {
        let connector = req.params.id && await ioc.getConnector(req.params.id);
        res.json(await connector?.metadata)
    }
}

export default new ConnectorController();