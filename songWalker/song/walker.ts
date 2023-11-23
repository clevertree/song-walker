import {parseFrequencyString} from "./note";
import constants from "./constants"

const BUFFER_DURATION = 1;
const START_DELAY = .1;
const DEFAULT_BPM = 60;
const DEFAULT_NOTE_DURATION = 1;
const DEFAULT_NOTE_VELOCITY = 1;

export type SongEventHandler = (tokenID: number, eventName: string, eventResult: any) => void;
export type SongState = {
    isPlaying: boolean,
    eventHandlers: SongEventHandler[],
    // playFrequency: (trackState: TrackState, frequency: string, duration: number, ...args: any[]) => void;
};

export type SongHandler = {
    addEventCallback: (callback: SongEventHandler) => void,
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
    instrument: Instrument,
    // startTime: number,
    currentTime: number,
    position: number,
    noteDuration: number,
    noteVelocity: number,
    beatsPerMinute: number,
    bufferDuration: number | null
    // promise: Promise<void> | null
}

export type Instrument = {
    playFrequency: (destination: AudioDestinationNode,
                    frequency: number,
                    startTime: number,
                    duration: number,
                    velocity: number) => void;
    stopActiveFrequencies: () => void;
}

export type InstrumentCallback = (config: object) => Promise<Instrument> | Instrument
export type TrackRenderer = {
    trackState: TrackState,
    playNote: (frequencyString: string, duration?: number, velocity?: number) => void;
    loadInstrument: (instrumentCallback: InstrumentCallback, config: object) => Promise<Instrument>;
    setVariable: (variablePath: string, variableValue: any) => void;
    startTrack: (trackCallback: TrackCallback) => void;
    wait: (duration: number) => Promise<void>;
    triggerEvent: SongEventHandler
    // setCurrentInstrument: (instrument:Instrument) => void
    // promise: Promise<void> | null
}

export type TrackCallback = (trackState: TrackState, trackRenderer: TrackRenderer) => Promise<void>;


let recentSongHandler: SongHandler | null = null;

export function walkSong(
    songCallback: TrackCallback,
) {
    const audioContext = new AudioContext();
    let trackState = {
        destination: audioContext.destination,
        instrument: UnassignedInstrument,
        // startTime: audioContext.currentTime,
        currentTime: audioContext.currentTime + START_DELAY,
        position: 0,
        noteDuration: DEFAULT_NOTE_DURATION,
        noteVelocity: DEFAULT_NOTE_VELOCITY,
        beatsPerMinute: DEFAULT_BPM,
        bufferDuration: BUFFER_DURATION
    }
    const songState: SongState = {
        eventHandlers: [],
        isPlaying: true
    }
    const trackHandler = walkTrack(songCallback, trackState, songState);
    const songHandler: SongHandler = {
        stopPlayback(): void {
            songState.isPlaying = false;
        },
        async waitForSongToFinish(): Promise<void> {
            await trackHandler.waitForTrackToFinish();
        },
        addEventCallback: function (callback: SongEventHandler) {
            songState.eventHandlers.push(callback)
        },
        getRootTrackState: function () {
            return trackState;
        }
    }
    if (recentSongHandler)
        recentSongHandler.stopPlayback();
    recentSongHandler = songHandler;
    return songHandler
}

// TODO: track args
export function walkTrack(
    trackCallback: TrackCallback,
    trackState: TrackState,
    songState: SongState) {
    const subTrackHandlers: TrackHandler[] = [];
    const trackRenderer: TrackRenderer = {
        trackState,
        async loadInstrument(instrumentCallback: InstrumentCallback, config: object): Promise<Instrument> {
            if (!songState.isPlaying)
                throw Error("Playback has ended");
            trackState.instrument = await instrumentCallback(config);
            return trackState.instrument;
        },
        playNote(frequencyString: string, duration?: number, velocity?: number): void {
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
            // if (typeof duration === "string")
            //     duration = parseDurationString(duration, trackBPM);
            console.log("playFrequency", frequency, startTime, durationWithBPM, velocity)
            trackState.instrument.playFrequency(
                trackState.destination,
                frequency,
                startTime,
                durationWithBPM,
                velocity);
        },
        setVariable(variablePath: string, variableValue: any): void {
            const split = variablePath.split('.');
            const lastPath = split.pop();
            if (!lastPath)
                throw new Error("Invalid path: " + variablePath)
            let target: any = trackState;
            for (const path of split) {
                target = target[path];
            }
            if (target.hasOwnProperty(lastPath) && typeof variableValue !== typeof target[lastPath]) {
                throw new Error(`Variable ${variablePath} already exists of a different type. ${typeof variableValue} !== ${typeof target[lastPath]}`)
            }
            target[lastPath] = variableValue;
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
            if (typeof trackState.bufferDuration === "number") {
                const waitTime = trackState.destination.context.currentTime - trackState.currentTime + trackState.bufferDuration;
                if (waitTime > 0) {
                    console.log(`Waiting ${waitTime}s`);
                    await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
                }
            }
        },
        triggerEvent(tokenID: number, eventName: string, eventResult: any) {
            for (const eventHandler of songState.eventHandlers)
                eventHandler(tokenID, eventName, eventResult)
        },
    }

    const trackPromise = trackCallback(trackState, trackRenderer)
    const trackHandler: TrackHandler = {
        async waitForTrackToFinish(): Promise<void> {
            await trackPromise;
            await Promise.all(subTrackHandlers)
            for (const subTrackHandler of subTrackHandlers) {
                await subTrackHandler.waitForTrackToFinish();
            }
        },
        getTrackState() {
            return trackState;
        }
    }
    return trackHandler;
}


const UnassignedInstrument: Instrument = {
    playFrequency(destination: AudioDestinationNode, frequency: number, startTime: number, duration: number, velocity: number): void {
        throw new Error(constants.ERR_NO_INSTRUMENT);
    },
    stopActiveFrequencies(): void {

    }

}