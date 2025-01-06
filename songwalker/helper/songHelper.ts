import {
    InstrumentInstance,
    PresetBank,
    SongCallback,
    SongWalkerState,
    TrackState,
    TrackStateOverrides
} from "@songwalker/types";
import PresetLibrary from "../presets/PresetLibrary";
import {parseNote} from "@songwalker";
import {DEFAULT_BUFFER_DURATION} from "@songwalker/constants/buffer";


export async function playSong(song: SongCallback, rootTrackOverrides: TrackStateOverrides = {}, context: AudioContext = new AudioContext()) {
    const songState = getSongPlayerState(context, rootTrackOverrides);
    await context.suspend();
    // Play song
    await song(songState)
    await waitForTrackToFinish(context, songState.rootTrackState);
    return songState;
}

export async function renderSong(song: SongCallback, rootTrackOverrides: TrackStateOverrides = {}) {
    const {lengthInSeconds} = await walkSongHeadless(song);
    const context = new OfflineAudioContext({
        numberOfChannels: 2,
        length: 44100 * lengthInSeconds,
        sampleRate: 44100,
    })
    const songState = getSongRendererState(context, rootTrackOverrides);
    // Render song
    await song(songState)
    return {
        renderedBuffer: await context.startRendering(),
        songState
    };
}

export async function walkSongHeadless(song: SongCallback) {
    const songState = getSongAnalysisState();
    // Analyze song
    await song(songState);
    const {
        rootTrackState: {
            currentTime,
            position
        }
    } = songState;
    return {lengthInSeconds: currentTime, lengthPosition: position};
}

export async function waitForTrackToFinish(context: AudioContext, track: TrackState) {
    const waitTime = track.currentTime - context.currentTime;
    if (waitTime > 0) {
        console.log(`Waiting ${waitTime} for track to finish ${context.currentTime} => ${track.currentTime}`)
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
    }
}

// function defaultWaitCallback(track: TrackState, duration: number) {
//     track.position += duration;
//     track.currentTime += duration * (60 / track.beatsPerMinute);
//     // console.info('wait', duration, track.currentTime, track.beatsPerMinute);
//     return typeof track.trackDuration !== "undefined" && track.trackDuration <= track.position;
// }

export async function defaultLoadPreset(songState: SongWalkerState, presetID: string | RegExp, config = {}, presetLibrary: PresetBank = PresetLibrary) {
    const preset = await findPreset(presetID, presetLibrary);
    return preset.loader(songState, {...preset.config, ...config});
}

export async function findPreset(presetID: string | RegExp, presetLibrary: PresetBank = PresetLibrary) {
    const filter = presetID instanceof RegExp ? presetID : new RegExp(presetID, 'i');
    for await (const preset of presetLibrary()) {
        if (filter.test(preset.title)) {
            return preset;
        }
    }
    throw new Error("Preset ID not found: " + presetID);
}

function getDefaultSongState(audioContext: BaseAudioContext, presetLibrary: PresetBank = PresetLibrary) {
    const songState: SongWalkerState = {
        bufferDuration: DEFAULT_BUFFER_DURATION,
        parseNote,
        loadPreset: async (presetID, config) => defaultLoadPreset(songState, presetID, config, presetLibrary),
        getContext: function () {
            return audioContext;
        },
        rootTrackState: {
            beatsPerMinute: 60,
            currentTime: 0, // Plus buffer duration? no.
            position: 0,
        },
        wait: async (track: TrackState, duration: number) => {
            track.position += duration;
            track.currentTime += duration * (60 / track.beatsPerMinute);
            // console.info('wait', duration, track.currentTime, track.beatsPerMinute);
            return typeof track.trackDuration !== "undefined" && track.trackDuration <= track.position;
        },
        execute: (track, commandString, overrides) => {
            let {
                instrument = () => {
                    throw new Error("Instrument not loaded");
                }
            } = track;
            let instrumentTrack: TrackState = {...track, ...overrides};

            if (track.effects) {
                for (const effect of track.effects) {
                    // Modifies TrackState.destination to create processing effect (i.e. reverb)
                    // Effect may encapsulate current instrument to modify commands in real-time (or skip notes)
                    effect(instrumentTrack, commandString)
                }
            }
            instrument(instrumentTrack, commandString);
        },
        executeTrack: function (track, trackCallback, overrides = {}, ...args) {
            const newTrackState: TrackState = {...track, ...overrides, position: 0};
            trackCallback(newTrackState, ...args)
        },
    };
    return songState;
}


export function getSongAnalysisState(): SongWalkerState {
    return {
        ...getDefaultSongState({} as BaseAudioContext),
        execute: () => {
            // Do not execute notes
        },
        executeTrack: () => {
            // Do not execute sub-tracks
        },
        loadPreset: async () => {
            // Do not load instruments
            return null as unknown as InstrumentInstance
        },
    }
}

export function getSongRendererState(context: OfflineAudioContext, rootTrackOverrides: TrackStateOverrides = {}, presetLibrary: PresetBank = PresetLibrary) {
    const songState = getDefaultSongState(context)
    Object.assign(songState.rootTrackState, rootTrackOverrides);
    return songState;
}

export function getSongPlayerState(context: AudioContext = new AudioContext(), rootTrackOverrides: TrackStateOverrides = {}, presetLibrary: PresetBank = PresetLibrary) {
    let autoResumed = false;
    const defaultSongState = getDefaultSongState(context, presetLibrary);
    const songState: SongWalkerState = {
        ...defaultSongState,
        execute: (track, commandString, overrides) => {
            if (track.currentTime < context.currentTime) {
                console.error("skipping note that occurs in the past: ",
                    commandString, 'currentTime:', track.currentTime, '<', 'audioContext.currentTime', context.currentTime)
                return
            }
            defaultSongState.execute(track, commandString, overrides);
            if (!autoResumed && context.state === 'suspended') {
                autoResumed = true;
                context.resume().then(() => console.info("AudioContext was resumed", context.currentTime));
            }
        },
        wait: async function (track, duration) {
            const trackEnded = defaultSongState.wait(track, duration);
            const waitTime = track.currentTime - context.currentTime - songState.bufferDuration
            if (waitTime > 0) {
                // console.log(`Waiting ${waitTime} seconds for ${context.currentTime} => ${track.currentTime} - ${BUFFER_DURATION}`)
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            }
            return trackEnded;
        },
    }
    Object.assign(songState.rootTrackState, rootTrackOverrides);
    return songState;
}

