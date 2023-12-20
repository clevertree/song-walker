import {parseFrequencyString} from "./note";
import constants from "./constants"
import {compileSongToCallback} from "@songwalker/compiler";

const BUFFER_DURATION = .1;
// const START_DELAY = .1;
const DEFAULT_BPM = 60;
const DEFAULT_NOTE_DURATION = 1;
const DEFAULT_NOTE_VELOCITY = 1;

export type TrackEventHandler = (trackEvent: TrackEvent, tokenID: number) => void;
export type SongState = {
    isPlaying: boolean,
    trackEventHandlers: {
        [trackName: string]: TrackEventHandler[]
    },
    // playFrequency: (trackState: TrackState, frequency: string, duration: number, ...args: any[]) => void;
};

export type SongHandler = {
    addEventCallback: (trackName: string, callback: TrackEventHandler) => void,
    waitForSongToFinish: () => Promise<void>
    stopPlayback: () => void,
    getRootTrackState: () => TrackState
}

export type TrackHandler = {
    waitForTrackToFinish: () => Promise<void>,
    getTrackState: () => TrackState
}

export type TrackState = {
    destination: AudioDestinationNode,
    instrument: InstrumentInstance,
    // startTime: number,
    currentTime: number,
    position: number,
    noteDuration: number,
    noteVelocity: number,
    beatsPerMinute: number,
    bufferDuration: number,
    [key: string]: any
    // promise: Promise<void> | null
}

export type NoteEvent = {
    destination: AudioDestinationNode,
    frequency: number,
    startTime: number,
    duration: number,
    velocity: number,
    handler?: NoteHandler
}

export type TrackEvent = NoteEvent;

export type InstrumentBank = {
    [instrumentPath: string]: InstrumentLoader
}

export interface NoteHandler {
    onended: ((this: any, ev: Event) => any) | null;

    stop(when?: number): void;
}

export type InstrumentInstance = (noteEvent: NoteEvent) => NoteHandler;

export type InstrumentLoader = (config: object) => Promise<InstrumentInstance> | InstrumentInstance
export type TrackRenderer = {
    trackState: TrackState,
    playNote: (frequencyString: string, duration?: number, velocity?: number) => NoteEvent;
    loadInstrument: (instrumentLoader: InstrumentLoader, config?: object) => Promise<InstrumentInstance>;
    setVariable: (variablePath: string, variableValue: any) => void;
    // getVariable: (variablePath: string) => any;
    startTrack: (trackCallback: TrackCallback) => void;
    wait: (duration: number) => Promise<void>;
    setCurrentToken: (tokenID: number) => void;
    // setCurrentInstrument: (instrument:Instrument) => void
    // promise: Promise<void> | null
}

export type TrackCallback = (trackRenderer: TrackRenderer) => Promise<void> | void;


export function compileAndWalk(songSource: string) {
    const callback = compileSongToCallback(songSource)
    return walkSong(callback);
}

export function walkSong(
    songCallback: TrackCallback,
) {
    const audioContext = new AudioContext();
    let trackState = {
        destination: audioContext.destination,
        instrument: UnassignedInstrument,
        // startTime: audioContext.currentTime,
        currentTime: audioContext.currentTime,
        position: 0,
        noteDuration: DEFAULT_NOTE_DURATION,
        noteVelocity: DEFAULT_NOTE_VELOCITY,
        beatsPerMinute: DEFAULT_BPM,
        bufferDuration: BUFFER_DURATION
    }
    const songState: SongState = {
        trackEventHandlers: {},
        isPlaying: true
    }
    const songHandler: SongHandler = {
        stopPlayback(): void {
            songState.isPlaying = false;
        },
        async waitForSongToFinish(): Promise<void> {
            await trackHandler.waitForTrackToFinish();
        },
        addEventCallback: function (trackName: string, callback: TrackEventHandler) {
            if (!songState.trackEventHandlers[trackName])
                songState.trackEventHandlers[trackName] = [];
            songState.trackEventHandlers[trackName].push(callback)
        },
        getRootTrackState: function () {
            return trackState;
        }
    }
    const trackHandler = walkTrack(songCallback, trackState, songState);
    return songHandler
}

// TODO: track args
export function walkTrack(
    trackCallback: TrackCallback,
    trackState: TrackState,
    songState: SongState) {
    const trackName = trackCallback.name;
    const subTrackHandlers: TrackHandler[] = [];
    const eventHandlers = songState.trackEventHandlers[trackName] || [];
    const trackRenderer: TrackRenderer = {
        trackState,
        async loadInstrument(instrumentLoader: InstrumentLoader, config: object | undefined): Promise<InstrumentInstance> {
            if (!songState.isPlaying)
                throw Error("Playback has ended");
            trackState.instrument = await instrumentLoader(config || {});
            return trackState.instrument;
        },
        playNote(frequencyString: string, duration?: number, velocity?: number): NoteEvent {
            if (!songState.isPlaying)
                throw Error("Playback has ended");
            if (typeof duration === 'undefined') {
                duration = trackState.noteDuration;
            } else {
                trackState.noteDuration = duration;
            }
            if (typeof velocity === 'undefined') {
                velocity = trackState.noteVelocity;
            } else {
                trackState.noteVelocity = velocity;
            }
            const startTime = trackState.currentTime + trackState.position;
            const durationWithBPM = duration * (60 / trackState.beatsPerMinute)
            const frequency = parseFrequencyString(frequencyString);
            const noteEvent: NoteEvent = {
                destination: trackState.destination,
                duration: durationWithBPM,
                frequency,
                startTime,
                velocity
            }        // if (typeof duration === "string")
            //     duration = parseDurationString(duration, trackBPM);
            // console.log("noteEvent", noteEvent)
            noteEvent.handler = trackState.instrument(noteEvent);
            for (const eventHandler of eventHandlers) {
                eventHandler(noteEvent, trackState.currentTokenID)
            }
            return noteEvent;
        },
        setVariable(variablePath: string, variableValue: any): void {
            // const split = variablePath.split('.');
            // const lastPath = split.pop();
            // if (!lastPath)
            //     throw new Error("Invalid path: " + variablePath)
            // let target: any = trackState;
            // for (const path of split) {
            //     target = target[path];
            // }
            // if (target.hasOwnProperty(lastPath) && typeof variableValue !== typeof target[lastPath]) {
            //     throw new Error(`Variable ${variablePath} already exists of a different type. ${typeof variableValue} !== ${typeof target[lastPath]}`)
            // }
            trackState[variablePath] = variableValue;
        },

        startTrack(trackCallback: TrackCallback): void {
            const subTrackState: TrackState = {
                ...trackState,
                position: 0,
            }
            const subTrackHandler = walkTrack(trackCallback, subTrackState, songState)
            subTrackHandlers.push(subTrackHandler);
        },
        async wait(duration: number): Promise<void> {
            trackState.position += duration;
            const durationWithBPM = duration * (60 / trackState.beatsPerMinute)
            trackState.currentTime += durationWithBPM;
            const waitTime = (trackState.currentTime - trackState.destination.context.currentTime) - trackState.bufferDuration;
            if (waitTime > 0) {
                console.log(`Waiting ${waitTime}s`, trackState.currentTime, trackState.destination.context.currentTime, durationWithBPM);
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            } else {
                console.log(`Not Waiting ${waitTime}s`, trackState.currentTime, trackState.destination.context.currentTime, durationWithBPM);

            }
        },
        setCurrentToken(tokenID: number) {
            trackState.currentTokenID = tokenID
        },
    }

    const trackPromise = trackCallback(trackRenderer)
    const trackHandler: TrackHandler = {
        async waitForTrackToFinish(): Promise<void> {
            await trackPromise;
            await Promise.all(subTrackHandlers.map(handler => handler.waitForTrackToFinish()))
            // for (const subTrackHandler of subTrackHandlers) {
            //     await subTrackHandler.waitForTrackToFinish();
            // }
            const waitTime = trackState.destination.context.currentTime - trackState.currentTime;
            console.log('waitForTrackToFinish', waitTime, trackCallback, subTrackHandlers)
            if (waitTime > 0) {
                console.log(`Waiting for track to end ${waitTime}s`);
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            }
        },
        getTrackState() {
            return trackState;
        }
    }
    return trackHandler;
}


export function getRequireCallback(instruments: InstrumentBank) {
    return function require(path: string) {
        if (instruments[path])
            return instruments[path];
        throw new Error("Instrument not found: " + path);
    }
}

const UnassignedInstrument: InstrumentInstance = (noteEvent: NoteEvent) => {
    throw new Error(constants.ERR_NO_INSTRUMENT);
}