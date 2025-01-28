import { Plugin } from './plugin.js';

export class Connector extends Plugin {

    find(task, profile) {
        const meta = this.extract(task);
        if (!meta?.name || !profile?.connectors?.length) {
            return null;
        }
        if (!this.cached.search[meta.name]) {
            this.cached.search[meta.name] = profile.connectors.find(item => item?.name === meta.name);
        }
        return this.cached.search[meta.name];
    }

    extract(task) {
        let tmp = (task?.function?.name && task.function.name.split("_")) || [];
        return {
            name: tmp[0],
            type: task?.type,
            action: tmp[1] || "run",
            arguments: task?.function?.arguments
        }
    }
}