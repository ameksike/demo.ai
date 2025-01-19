import { getFromMeta, path } from '../utils/polyfill.js';
const { __dirname } = getFromMeta(import.meta);

function extract(name) {
    const [service, action = 'run'] = name.split(/[_:]/);
    return { service, action };
}

export async function getService(name) {
    try {
        let meta = extract(name);
        let file = path.resolve(__dirname, "../services", meta.service + ".service.js")
        let lib = await import(new URL("file://" + file));
        return { lib, meta };
    }
    catch (error) {
        console.log({ src: "tils:locator:getService", error });
        return null;
    }
}

export async function run(task, scope) {
    let { lib, meta } = await getService(task.name);
    let action = lib && lib[meta.action];
    if (!(action instanceof Function)) {
        return null;
    }
    try {
        return await action.apply(scope || {}, [task.parameters]);;
    }
    catch (error) {
        console.log({ src: "utils:locator:run", error });
        return null;
    }
}