import fs from 'fs/promises';
import { getFromMeta, path as _path } from './polyfill.js';
const { __dirname } = getFromMeta(import.meta);

export class Locator {

    /**
     * @type {Record<string, any>}
     */
    cache;

    constructor(options = null) {
        this.cache = options?.cache || {};
        this.logger = options?.logger || console;
    }

    get path() {
        return _path.resolve(__dirname, "../../../");
    }

    pathTo(...args) {
        return _path.resolve(this.path, ...args);
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
        const { args = [], location = "src/vendor/connectors" } = options || null;
        try {
            if (!this.cache[location]) {
                this.cache[location] = {};
            }
            if (this.cache[location][name]) {
                return this.cache[location][name];
            }
            let meta = this.extract(name);
            let file = _path.resolve(this.path, location, meta.service, "index.js");
            let mod = await import(new URL("file://" + file));
            let arg = [
                {
                    name,
                    path: _path.resolve(this.path, location, meta.service),
                    logger: this.logger,
                    ioc: this
                },
                ...args
            ];
            let lib = mod?.default instanceof Function ? new mod.default(...arg) : (mod.default || mod);
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
            let { lib, meta } = await this.get(task.name, { location: "src/vendor/connectors" });
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
        const connector = await this.get(name, { args, location: "src/vendor/connectors" });
        return connector?.lib;
    }

    getConnectorPath(name = "") {
        return _path.resolve(this.path, "src/vendor/connectors", name || "");
    }

    getConnectors() {
        return this.scan(
            this.getConnectorPath(),
            { recursive: false, filter: 'directories', extract: 'name' }
        );
    }

    /**
     * @description Get provider instance 
     * @param {*} name 
     * @param {*} args 
     * @returns {*} connector
     */
    async getProvider(name, args) {
        const provider = await this.get(name, { args, location: "src/vendor/providers" });
        return provider?.lib;
    }

    getProviderPath(name = "") {
        return _path.resolve(this.path, "src/vendor/providers", name || "");
    }

    getProviders() {
        return this.scan(
            this.getProviderPath(),
            { recursive: false, filter: 'directories', extract: 'name' }
        );
    }

    /**
     * @description Scan a directory
     * @param {String} directoryPath 
     * @returns {Array<String>}
     */
    async scan(directoryPath, options = { recursive: true, filter: 'all', extract: 'path' }) {
        try {
            const entries = await fs.readdir(directoryPath, { withFileTypes: true });
            function get({ extract, fullPath, entry }) {
                switch (extract) {
                    case 'name':
                        return entry.name;
                    case 'path':
                        return fullPath;
                    default:
                        return entry;
                }
            }
            const files = await Promise.all(entries.map(async (entry) => {
                const fullPath = _path.join(directoryPath, entry.name);
                if (options.filter === 'directories' && !entry.isDirectory()) return;
                if (options.filter === 'files' && entry.isDirectory()) return;
                return entry.isDirectory() && options.recursive
                    ? this.scan(fullPath, options)
                    : get({ fullPath, entry, extract: options.extract });
            }));
            return files.flat().filter(Boolean);
        } catch (err) {
            console.error('Error listing files:', err);
            return [];
        }
    }
}

export default new Locator();