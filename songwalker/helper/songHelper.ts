import {
    CommandParams,
    CommandWithParams,
    InstrumentInstance,
    PresetBankBase,
    SongFunctions,
    TrackState
} from "@songwalker/types";
import PresetLibrary from "../presets/PresetLibrary";
import Errors from '../constants/errors'
import {parseCommandValues} from "@songwalker";

interface SongFunctionsExtended extends SongFunctions {
    parseAndExecute: (track: TrackState, commandString: string, additionalParams?: CommandParams) => void
}

export function getDefaultSongFunctions(presetLibrary: PresetBankBase = PresetLibrary) {
    const functions: SongFunctionsExtended = {
        waitForTrackToFinish: async function (track) {
            const waitTime = track.currentTime - track.destination.context.currentTime;
            if (waitTime > 0) {
                console.log(`Waiting ${waitTime} for track to finish ${track.destination.context.currentTime} => ${track.currentTime}`)
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            }
        },
        wait: function defaultWaitCallback(track, duration) {
            track.position += duration;
            track.currentTime += duration * (60 / track.beatsPerMinute);
            // if (track.parentTrack) {
            //     const {minimumEndTime} = track.parentTrack;
            //     if (!minimumEndTime || minimumEndTime < track.currentTime)
            //         track.parentTrack.minimumEndTime = track.currentTime;
            // }
            // console.info('wait', duration, track.currentTime, track.beatsPerMinute);
            // TODO: check for track end duration and potentially return 'true'
            return false;
        },
        waitAsync: async function defaultWaitCallback(track, duration) {
            const trackEnded = functions.wait(track, duration);
            const waitTime = track.currentTime - track.destination.context.currentTime - track.bufferDuration;
            if (waitTime > 0) {
                // console.log(`Waiting ${waitTime} seconds for ${track.destination.context.currentTime} => ${track.currentTime} - ${track.bufferDuration}`)
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            }
            return trackEnded;
        },
        loadPreset: async function (track: TrackState, presetID, config = {}) {
            const preset = await presetLibrary.findPreset(presetID);
            if (preset) {
                return preset.loader(track, {...preset.config, ...config});
            }
            throw new Error("Preset id not found: " + presetID);
        },
        execute: function (track: TrackState, commandString: string, params: CommandParams = {}) {
            let {
                destination: {
                    context: audioContext
                },
                currentTime,
                bufferDuration
            } = track;
            const startTime = currentTime + bufferDuration;
            if (startTime < audioContext.currentTime) {
                console.error("skipping note that occurs in the past: ",
                    commandString, 'startTime:', startTime, '<', 'audioContext.currentTime', audioContext.currentTime)
                return
            }
            const command: CommandWithParams = {
                commandString: commandString,
                startTime,
                ...params
            }
            // const command: string, params: CommandParams = {command, ...track, ...props};
            // Modifies TrackState.destination to create processing effect (i.e. reverb)
            // To modify or add notes, effects have to modify the CommandState
            track.effects.forEach(effect => effect(track, command));
            // TODO: check for track end time?
            track.instrument(track, command);
        },
        // executeCallback: function (track: TrackState, callback, ...args) {
        //     const subTrack = {
        //         ...track,
        //         parentTrack: track,
        //     }
        //     callback(subTrack, ...args);
        // },
        parseAndExecute: function (track: TrackState, commandString: string, additionalParams: CommandParams = {}) {
            const {command, params} = parseCommandValues(commandString);
            functions.execute(track, command, {...params, ...additionalParams});
        }
    };
    return functions;
}

export const defaultEmptyInstrument: InstrumentInstance = () => {
    throw new Error(Errors.ERR_NO_INSTRUMENT);
}

export function getDefaultTrackState(destination: AudioNode, bufferDuration: number = 0): TrackState {
    return {
        beatsPerMinute: 60,
        bufferDuration,
        currentTime: destination.context.currentTime, // Plus buffer duration? no.
        position: 0,
        duration: 1,
        velocity: 128,
        velocityDivisor: 128,
        instrument: defaultEmptyInstrument,
        effects: [],
        destination
        // duration: 0,
        // velocity: 0,
        // velocityDivisor: 1,
    }
}
