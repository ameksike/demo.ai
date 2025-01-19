import * as path from 'path';
import { fileURLToPath } from 'url';

export function getFromMeta(importMeta) {
    importMeta = importMeta || import.meta;
    const __filename = fileURLToPath(importMeta.url);
    const __dirname = path.dirname(__filename);
    return { __filename, __dirname };
}

const { __filename, __dirname } = getFromMeta(import.meta);

export * from 'path';
export { __filename, __dirname, path };