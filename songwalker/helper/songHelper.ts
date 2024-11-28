import {SongFunctions} from "@songwalker/types";

export const defaultSongFunctions: SongFunctions = {
    wait: async function defaultWaitCallback(this, duration) {
        debugger;
        this.currentTime += duration * (60 / this.beatsPerMinute);
        const waitTime = this.currentTime - this.destination.context.currentTime;
        if (waitTime > 0) {
            console.log(`Waiting ${waitTime} seconds`)
            await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
        }
    },
    loadInstrument: async function defaultLoadInstrumentCallback(instrumentPath, config) {
        debugger;

    },
    loadPreset: async function defaultLoadPresetCallback(presetPath, configOverride) {
        debugger;

    }
}
