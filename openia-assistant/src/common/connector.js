export class Connector {

    constructor(options = null) {
        const { logger = console } = options || {};
        this.logger = logger;
        this.cached = {};
    }

    find(task, profile) {
        const meta = this.getMeta(task);
        if (!meta?.name || !profile?.connectors?.length) {
            return null;
        }
        if (!this.cached[meta.name]) {
            this.cached[meta.name] = profile.connectors.find(item => item?.name === meta.name);
        }
        return this.cached[meta.name];
    }

    getMeta(task) {
        let tmp = (task?.function?.name && task.function.name.split("_")) || [];
        return {
            name: tmp[0],
            action: tmp[1] || "run",
            type: task?.type,
            arguments: task?.function?.arguments
        }
    }
}