import {
    CommandParams,
    CommandState,
    InstrumentInstance,
    PresetBankBase,
    SongFunctions,
    TrackState
} from "@songwalker/types";
import PresetLibrary from "../presets/PresetLibrary";
import Errors from '../constants/errors'
import {parseCommandValues} from "@songwalker";

interface SongFunctionsWithParser extends SongFunctions {
    parseAndPlayCommand: (this: TrackState, commandString: string) => void
}

export function getDefaultSongFunctions(presetLibrary: PresetBankBase = PresetLibrary) {
    const functions: SongFunctionsWithParser = {
        wait: function defaultWaitCallback(this, duration) {
            this.position += duration;
            this.currentTime += duration * (60 / this.beatsPerMinute);
            // TODO: check for track end duration and potentially return 'true'
            return false;
        },
        waitAsync: async function defaultWaitCallback(this, duration) {
            const trackEnded = functions.wait.bind(this)(duration);
            const waitTime = this.currentTime - this.destination.context.currentTime;
            if (waitTime > 0) {
                console.log(`Waiting ${waitTime} seconds`)
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            }
            return trackEnded;
        },
        loadPreset: async function (this: TrackState, presetID, config = {}) {
            const preset = await presetLibrary.findPreset(presetID);
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
            // Modifies TrackState.destination to create processing effect (i.e. reverb)
            // To modify or add notes, effects have to modify the CommandState
            this.effects.forEach(effect => effect.bind(this)(commandState));
            // TODO: check for track end time
            commandState.instrument.bind(this)(commandState);
        },
        parseAndPlayCommand: function (this: TrackState, commandString: string) {
            const {command, params} = parseCommandValues(commandString);
            functions.playCommand.bind(this)(command, params);
        }
    };
    return functions;
}

export const defaultEmptyInstrument: InstrumentInstance = () => {
    throw new Error(Errors.ERR_NO_INSTRUMENT);
}

export function getDefaultTrackState(destination: AudioNode): TrackState {
    return {
        beatsPerMinute: 60,
        bufferDuration: 0,
        currentTime: 0,
        position: 0,
        instrument: defaultEmptyInstrument,
        effects: [],
        destination
        // duration: 0,
        // velocity: 0,
        // velocityDivisor: 1,
    }
}
