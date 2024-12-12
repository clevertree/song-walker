import {CommandParams, CommandState, InstrumentInstance, SongFunctions, TrackState} from "@songwalker/types";
import PresetLibrary from "../presets/PresetLibrary";

export const defaultSongFunctions: SongFunctions = {
    wait: async function defaultWaitCallback(this, duration) {
        this.currentTime += duration * (60 / this.beatsPerMinute);
        const waitTime = this.currentTime - this.destination.context.currentTime;
        if (waitTime > 0) {
            console.log(`Waiting ${waitTime} seconds`)
            await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
        }
        // TODO: track position
    },
    loadPreset: async function (this: TrackState, presetID, config = {}) {
        const preset = await PresetLibrary.findPreset(presetID);
        if (preset) {
            return preset.loader.bind(this)({...preset.config, ...config});
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
        const commandState: CommandState = {command, ...this, ...props};
        debugger;
        if (this.effects) {
            // Effects load in order
            for (const effect of this.effects) {
                // Modifies TrackState.destination to create processing effect (i.e. reverb)
                effect.bind(this)(commandState);
                // To modify or add notes, effects have to modify the CommandState

            }
        }
        // TODO: check for track end time
        commandState.instrument.bind(this)(commandState);
    }
}

export const defaultEmptyInstrument: InstrumentInstance = () => {
    throw new Error("No instrument is loaded");
}
export const defaultTrackState: TrackState = {
    beatsPerMinute: 60,
    bufferDuration: 0,
    currentTime: 0,
    destination: {} as AudioNode,
    noteDuration: 0,
    noteVelocity: 0,
    velocityDivisor: 1,
    instrument: defaultEmptyInstrument,
    effects: []
}
