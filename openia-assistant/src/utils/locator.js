import { getFromMeta, path } from '../utils/polyfill.js';
const { __dirname } = getFromMeta(import.meta);

export class ServiceLocator {

    /**
     * @type {Record<string, any>}
     */
    cache;

    constructor(options = null) {
        this.cache = options?.cache || {};
        this.path = options?.path || process.env.PLUGIN_PATH || "../plugins";
        this.logger = options?.logger || console;
    }

    /**
     * @description get service metadata
     * @param {string} name 
     * @returns {{action: string; service: string;}} metadata
     */
    extract(name) {
        const [service, action = 'run'] = name.split(/[_:]/);
        return { service, action };
    }

    /**
     * @description load a service by name and location or path 
     * @param {string} name 
     * @param {string|null} [location] 
     * @returns {{lib:Object; meta:{action: string; service: string;}}} service descriptor
     */
    async get(name, location = null) {
        location = location || this.path;
        try {
            if (this.cache[name]) {
                return this.cache[name];
            }
            let meta = this.extract(name);
            let file = path.resolve(__dirname, location, meta.service + ".js");
            let lib = await import(new URL("file://" + file));
            this.cache[name] = { lib, meta };
            return this.cache[name];
        }
        catch (error) {
            this.logger?.log({ src: "Utils:ServiceLocator:get", error, data: { location, name } });
            return null;
        }
    }

    /**
     * @description excecute the task action with arguments in the scope
     * @param {{name: string; arguments: Record<string, any>}} task 
     * @param {Object} [scope] 
     * @returns {any} response
     */
    async run(task, scope) {
        try {
            let { lib, meta } = await this.get(task.name);
            let action = lib && lib[meta.action];
            if (!(action instanceof Function)) {
                return null;
            }
            return await action.apply(scope || {}, [task.arguments || task.args]);
        }
        catch (error) {
            this.logger?.log({ src: "Utils:ServiceLocator:run", error });
            return null;
        }
    }
}

export default new ServiceLocator();