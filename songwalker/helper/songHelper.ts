import {
    CommandParams,
    CommandWithParams,
    InstrumentInstance,
    PresetBankBase,
    SongCallback,
    SongFunctions,
    TrackState
} from "@songwalker/types";
import PresetLibrary from "../presets/PresetLibrary";
import Errors from '../constants/errors'
import {parseCommandValues} from "@songwalker";
import {DEFAULT_BUFFER_DURATION} from "@songwalker/constants/buffer";

interface SongFunctionsExtended extends SongFunctions {
    parseAndExecute: (track: TrackState, commandString: string, additionalParams?: CommandParams) => void
}

export async function playSong(song: SongCallback, context: AudioContext = new AudioContext()) {
    const SongFunctions = getDefaultSongFunctions();
    const track: TrackState = getDefaultTrackState(context.destination);
    await context.suspend();
    await song(track, SongFunctions)
    await SongFunctions.waitForTrackToFinish(track);
}

export function getDefaultSongFunctions(presetLibrary: PresetBankBase = PresetLibrary) {
    let didAutoResume = false;
    let bufferDuration = DEFAULT_BUFFER_DURATION;
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
            const waitTime = track.currentTime - track.destination.context.currentTime - bufferDuration
            if (waitTime > 0) {
                // console.log(`Waiting ${waitTime} seconds for ${track.destination.context.currentTime} => ${track.currentTime} - ${BUFFER_DURATION}`)
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            }
            // while (track.destination.context.state === "suspended") {
            //     console.log(`Waiting ${waitTime} for track to resume`, track.destination.context.currentTime)
            //     await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            // }
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
                currentTime
            } = track;
            if (currentTime < audioContext.currentTime) {
                console.error("skipping note that occurs in the past: ",
                    commandString, 'currentTime:', currentTime, '<', 'audioContext.currentTime', audioContext.currentTime)
                return
            }
            const command: CommandWithParams = {
                commandString: commandString,
                ...params
            }
            // const command: string, params: CommandParams = {command, ...track, ...props};
            // Modifies TrackState.destination to create processing effect (i.e. reverb)
            // To modify or add notes, effects have to modify the CommandState
            track.effects.forEach(effect => effect(track, command));
            // TODO: check for track end time?
            track.instrument(track, command);
            if (!didAutoResume && audioContext.state === 'suspended' && audioContext instanceof AudioContext) {
                audioContext.resume().then(() => console.info("AudioContext was resumed", audioContext.currentTime));
                didAutoResume = true;
            }
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

export function getDefaultTrackState(destination: AudioNode): TrackState {
    return {
        beatsPerMinute: 60,
        currentTime: destination.context.currentTime, // Plus buffer duration? no.
        position: 0,
        // pan: 0,
        // duration: 1,
        // velocity: 128,
        // velocityDivisor: 128,
        instrument: defaultEmptyInstrument,
        effects: [],
        destination
    }
}
