import Speaker from 'speaker';

export class SpeakerTool {

    constructor() {
        this.drv = null;
    }

    get(options = null) {
        const {
            channels = 1,        // 2 channels (stereo)
            bitDepth = 16,       // 16-bit samples
            sampleRate = 24000,  // 44,100 Hz sample rate
            cached = true,
            driver = null
        } = options || {};

        if (driver instanceof Speaker) {
            cached && (this.drv = driver);
            return driver;
        }

        if (cached && this.drv) {
            return this.drv;
        }

        const tmp = new Speaker({
            channels,
            bitDepth,
            sampleRate,
        });

        cached && (this.drv = tmp);
        return tmp;
    }

    talk(chunk, options) {
        const driver = this.get(options);
        driver.write(chunk);
        return this;
    }

    stop(options) {
        const drv = this.get(options);
        drv?.end();
        return this;
    }
}

export default new SpeakerTool();