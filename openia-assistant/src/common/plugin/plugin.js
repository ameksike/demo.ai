import { Locator } from '../utils/locator.js';
import * as config from "../utils/config.js";
import dotenv from "dotenv";

export class Plugin {

    /**
     * @type {Console}
     */
    logger;

    /**
     * @type {Locator}
     */
    ioc;

    constructor(options = null) {
        this.name = options?.name || "";
        this.path = options?.path || "";
        this.logger = options?.logger || console;
        this.ioc = options?.ioc || new Locator();
        this.cached = {
            search: {
                search: {},
                metadata: null
            }
        };
    }

    /**
     * Public action definition 
     */
    get metadata() {
        return new Promise(async (resolve) => {
            try {
                if (!this.cached.metadata) {
                    this.cached.metadata = await config.load("metadata", this.path) || {};
                    this.cached.metadata.id = this.name || this.cached.metadata.name;
                }
            }
            catch (error) {
                this.logger?.error({
                    src: "Common:Connector:Metadata:Get",
                    error: error?.message
                });
            }
            finally {
                resolve(this.cached.metadata || {});
            }
        })
    }
}


dotenv.config();