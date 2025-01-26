import { getFromMeta, path } from './polyfill.js';
const { __dirname } = getFromMeta(import.meta);

export class Locator {

    /**
     * @type {Record<string, any>}
     */
    cache;

    constructor(options = null) {
        this.cache = options?.cache || {};
        this.path = options?.path || "vendor/connectors";
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
     * @param {Object} [options] 
     * @param {Array<*>} [options.args] 
     * @param {string|null} [options.location] 
     * @returns {{mod:Object; meta:{action: string; service: string;}}} service descriptor
     */
    async get(name, options) {
        const { args = [], location = this.path } = options || null;
        try {
            if (!this.cache[location]) {
                this.cache[location] = {};
            }
            if (this.cache[location][name]) {
                return this.cache[location][name];
            }
            let meta = this.extract(name);
            let file = path.resolve(__dirname, "../", location, meta.service, "index.js");
            let mod = await import(new URL("file://" + file));
            let lib = mod?.default instanceof Function ? new mod.default(...args) : (mod.default || mod);
            this.cache[location][name] = { mod, meta, default: mod.default || mod, lib };
            this.logger?.log({ src: "Common:Locator:get", data: { available: !!mod, file } });
            return this.cache[location][name];
        }
        catch (error) {
            this.logger?.log({ src: "Common:Locator:get", error, data: { name, location, args } });
            return null;
        }
    }

    /**
     * @description excecute the task action with arguments in the scope
     * @param {{name: string; arguments: Record<string, any>}} task 
     * @param {Object} [scope]
     * @returns {any} response
     */
    async run(task, scope = null) {
        try {
            let { lib, meta } = await this.get(task.name, { location: "vendor/connectors" });
            let action = lib && lib[meta.action];
            let args = task.arguments || task.args;
            if (!(action instanceof Function)) {
                return null;
            }
            return await action.apply(scope || lib, Array.isArray(args) ? args : [args]);
        }
        catch (error) {
            this.logger?.log({ src: "Common:Locator:run", error });
            return null;
        }
    }

    /**
     * @description Get connector instance 
     * @param {*} name 
     * @param {*} args 
     * @returns {*} connector
     */
    async getConnector(name, args) {
        const connector = await this.get(name, { args, location: "vendor/connectors" });
        return connector?.lib;
    }

    /**
     * @description Get provider instance 
     * @param {*} name 
     * @param {*} args 
     * @returns {*} connector
     */
    async getProvider(name, args) {
        const provider = await this.get(name, { args, location: "vendor/providers" });
        return provider?.lib;
    }
}

export default new Locator();