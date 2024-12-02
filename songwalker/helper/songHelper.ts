import {CommandParams, SongFunctions, TrackState} from "@songwalker/types";
import PresetLibrary from "../instruments/library";

export const defaultSongFunctions: SongFunctions = {
    wait: async function defaultWaitCallback(this, duration) {
        this.currentTime += duration * (60 / this.beatsPerMinute);
        const waitTime = this.currentTime - this.destination.context.currentTime;
        if (waitTime > 0) {
            console.log(`Waiting ${waitTime} seconds`)
            await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
        }
    },
    loadInstrument: async function defaultLoadInstrumentCallback(this: TrackState, presetID, config = {}) {
        for await (const preset of PresetLibrary.listPresets()) {
            if (preset.title === presetID)
                return preset.instrument.bind(this)({...preset.config, ...config});
        }
        throw new Error("Preset id not found: " + presetID);
    },
    playCommand: function (this: TrackState, command: string, props: CommandParams = {}) {
        let {
            destination: {
                context: audioContext
            },
            currentTime,
        } = this;
        if (currentTime < audioContext.currentTime) {
            console.warn("skipping note that occurs in the past: ",
                command, currentTime, '<', audioContext.currentTime)
            return
        }
        debugger;
        // TODO: check for track end time
        return this.instrument.bind(this)({command, ...this, ...props});
    }
}
