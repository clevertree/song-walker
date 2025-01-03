import {
    InstrumentInstance,
    PresetBankBase,
    SongCallback,
    SongWalkerState,
    TrackState,
    TrackStateOverrides
} from "@songwalker/types";
import PresetLibrary from "../presets/PresetLibrary";
import Errors from '../constants/errors'
import {parseNote} from "@songwalker";
import {DEFAULT_BUFFER_DURATION} from "@songwalker/constants/buffer";


export async function playSong(song: SongCallback, context: AudioContext = new AudioContext(), overrides: TrackStateOverrides = {}) {
    const songState = getDefaultSongWalkerState(context, overrides);
    await context.suspend();
    await song(songState)
    await songState.waitForTrackToFinish(songState.rootTrackState);
    return songState;
}

export async function renderSong(song: SongCallback, context: OfflineAudioContext, overrides: TrackStateOverrides = {}) {
    const songState = getDefaultSongWalkerState(context, overrides);
    await song(songState)
    return {
        renderedBuffer: await context.startRendering(),
        songState
    };
}

export function getDefaultSongWalkerState(context: BaseAudioContext, overrides: TrackStateOverrides = {}, presetLibrary: PresetBankBase = PresetLibrary) {
    let bufferDuration = DEFAULT_BUFFER_DURATION;
    let autoResumeCallback = () => {
    };
    if (context instanceof AudioContext) {
        autoResumeCallback = () => {
            if (context.state === 'suspended') {
                autoResumeCallback = () => {
                };
                context.resume().then(() => console.info("AudioContext was resumed", context.currentTime));
            }
        }
    }
    const rootTrackState: TrackState = getDefaultTrackState(context.destination, overrides);
    const songState: SongWalkerState = {
        context,
        rootTrackState,
        // waitForSongToFinish: async () => songState.waitForTrackToFinish(songState.rootTrackState),
        waitForTrackToFinish: async function (track) {
            const waitTime = track.currentTime - context.currentTime;
            if (waitTime > 0) {
                console.log(`Waiting ${waitTime} for track to finish ${context.currentTime} => ${track.currentTime}`)
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            }
        },
        wait: function defaultWaitCallback(track, duration) {
            track.position += duration;
            track.currentTime += duration * (60 / track.beatsPerMinute);
            // console.info('wait', duration, track.currentTime, track.beatsPerMinute);
            // TODO: check for track end duration and potentially return 'true'
            return false;
        },
        waitAsync: async function defaultWaitCallback(track, duration) {
            const trackEnded = songState.wait(track, duration);
            const waitTime = track.currentTime - context.currentTime - bufferDuration
            if (waitTime > 0) {
                // console.log(`Waiting ${waitTime} seconds for ${context.currentTime} => ${track.currentTime} - ${BUFFER_DURATION}`)
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            }
            return trackEnded;
        },
        loadPreset: async function (presetID, config = {}) {
            const preset = await presetLibrary.findPreset(presetID);
            if (preset) {
                return preset.loader(songState, {...preset.config, ...config});
            }
            throw new Error("Preset id not found: " + presetID);
        },
        execute: function (track, commandString, overrides = {}) {
            let {
                currentTime,
                instrument = () => {
                    throw new Error("Instrument not loaded");
                }
            } = track;
            if (currentTime < context.currentTime) {
                console.error("skipping note that occurs in the past: ",
                    commandString, 'currentTime:', currentTime, '<', 'audioContext.currentTime', context.currentTime)
                return
            }

            // Create new object for instrument execution
            let instrumentTrack: TrackState = {...track, ...overrides};

            if (track.effects) {
                for (const effect of track.effects) {
                    const newTrackObject = effect(track, commandString)
                    if (!newTrackObject) {
                        // If nothing was returned, note is skipped.
                        console.warn(`Effect returned ${newTrackObject}, so note was skipped.`)
                        return;
                    }
                    // Modifies TrackState.destination to create processing effect (i.e. reverb)
                    // Effect may encapsulate current instrument to modify commands in real-time
                    instrumentTrack = newTrackObject;
                }
            }
            // TODO: check for track end time?
            instrument(instrumentTrack, commandString);
            autoResumeCallback();
        },
        executeTrack: function (track, trackCallback, overrides = {}, ...args) {
            const newTrackState: TrackState = {...track, ...overrides, position: 0};
            trackCallback(newTrackState, ...args)
        },
        // executeCallback: function (track: TrackState, callback, ...args) {
        //     const subTrack = {
        //         ...track,
        //         parentTrack: track,
        //     }
        //     callback(subTrack, ...args);
        // },
        parseNote,
    };
    return songState;
}

export const defaultEmptyInstrument: InstrumentInstance = () => {
    throw new Error(Errors.ERR_NO_INSTRUMENT);
}

export function getDefaultTrackState(destination: AudioNode, overrides: TrackStateOverrides = {}): TrackState {
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
        destination,
        ...overrides
    }
}
