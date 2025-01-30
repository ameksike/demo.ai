
import fs from 'fs/promises';
import { getFromMeta, path as _path } from './polyfill.js';
import KsCryp from 'kscryp';
const { __dirname } = getFromMeta(import.meta);

/**
 * @description load content from JSON file
 * @param {string} name 
 * @param {string} [path] 
 * @param {string} [ext=".json"] 
 * @returns {*} content
 */
export async function load(name = "content", path = "", ext = ".json") {
    try {
        const filePath = _path.resolve(__dirname, "../../../", path, name + ext);
        const data = await fs.readFile(filePath, 'utf8');
        return KsCryp.decode(data, "json");
    } catch (error) {
        console.log({
            src: "Config:load",
            error: error?.message || error,
            data: { name, path, ext }
        });
        return null;
    }
}

/**
 * @description save content inside a JSON file
 * @param {string} name 
 * @param {string} [path] 
 * @param {string} [ext=".json"] 
 * @returns {*} content
 */
export async function save(data, name = "content", path = "", ext = ".json") {
    try {
        const filePath = _path.resolve(__dirname, "../../../", path, name + ext);
        const strData = KsCryp.encode(data, "json", { space: 2 });
        strData && await fs.writeFile(filePath, strData);
        return data;
    } catch (error) {
        console.log({
            src: "Config:save",
            error: error?.message || error,
            data: { name, path, ext }
        });
        return null;
    }
}

export function flatten(str) {
    return str.replace(/\s{2,}/g, ' ').trim();
}