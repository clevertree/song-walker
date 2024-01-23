import {matchFrequencyString, parseFrequencyString} from "./note";
import {ERRORS} from "./constants"
import {
    HandlesTrackEvents,
    InstrumentInstance,
    InstrumentLoader,
    InstrumentPreset,
    SongError,
    SongHandler,
    SongTrackEvent,
    TrackCallback,
    TrackHandler,
    TrackRenderer,
    TrackState
} from "@songwalker/types";
import InstrumentLibrary from "@/instruments";
import PresetLibrary from "@/samples";

const BUFFER_DURATION = .1;
// const START_DELAY = .1;
const DEFAULT_BPM = 120;
const DEFAULT_NOTE_DURATION = 1;
const DEFAULT_NOTE_VELOCITY = 1;


export class DurationEvent implements SongTrackEvent {
    destination: AudioDestinationNode;
    startTime: number;
    duration: number;

    constructor(destination: AudioDestinationNode, startTime: number, duration: number) {
        this.destination = destination;
        this.startTime = startTime;
        this.duration = duration;
    }

    async waitForEventStart() {
        await wait((this.startTime - this.destination.context.currentTime) * 1000)
    }

    async waitForEventEnd() {
        await wait((this.startTime - this.destination.context.currentTime + this.duration) * 1000)
    }
}

export class PlayNoteEvent implements SongTrackEvent {
    destination: AudioDestinationNode;
    startTime: number;
    duration: number | undefined;
    value: string;
    velocity: number | undefined;
    handlerPromise?: Promise<void>;

    constructor(destination: AudioDestinationNode, value: string, startTime: number, duration?: number, velocity?: number) {
        this.destination = destination;
        this.startTime = startTime;
        this.duration = duration;
        this.value = value;
        this.velocity = velocity;
    }

    parseFrequency() {
        return parseFrequencyString(this.value);
    }

    hasFrequency() {
        return matchFrequencyString(this.value) || false;
    }

    async waitForEventStart() {
        await wait((this.startTime - this.destination.context.currentTime) * 1000)
    }

    async waitForEventEnd() {
        if (this.duration) {
            await wait((this.startTime - this.destination.context.currentTime + this.duration) * 1000)
        } else {
            await this.handlerPromise;
        }
    }

    setHandler(noteHandler: NoteHandler) {
        this.handlerPromise = new Promise((resolve) => {
            noteHandler.addEventListener('ended', e => resolve());
        })
    }
}

export class LoadInstrumentEvent implements SongTrackEvent {
    promise: Promise<InstrumentInstance> | InstrumentInstance;
    loader: InstrumentLoader;

    constructor(loader: InstrumentLoader, promise: Promise<InstrumentInstance> | InstrumentInstance) {
        this.loader = loader
        this.promise = promise;
    }

    async waitForEventStart() {
    }

    async waitForEventEnd() {
        await this.promise;
    }
}

export class SetVariableEvent implements SongTrackEvent {
    path: string;
    value: any;

    constructor(variablePath: string, variableValue: any) {
        this.path = variablePath;
        this.value = variableValue;
    }

    async waitForEventStart() {
    }

    async waitForEventEnd() {
        await new Promise((resolve) => {
            setTimeout(resolve, 1000)
        })
    }
}

export class StartTrackEvent implements SongTrackEvent {
    trackHandler: TrackHandler;

    constructor(subTrackHandler: TrackHandler) {
        this.trackHandler = subTrackHandler;
    }

    async waitForEventStart() {
    }

    async waitForEventEnd() {
        await this.trackHandler.waitForTrackToFinish()
    }
}


export interface NoteHandler {
    addEventListener(type: string, listener: (evt: Event) => void, options?: boolean | AddEventListenerOptions): void;

    stop(when?: number): void;
}


// export function compileToSongPlayer(songSource: string, trackEventHandler: HandlesTrackEvents) {
//     const callback = compileSongToCallback(songSource)
//     return new SongPlayer(callback, trackEventHandler);
// }

export class SongPlayer implements SongHandler {
    private callback: TrackCallback;
    private trackEventHandler: HandlesTrackEvents;
    private trackHandler: TrackHandler | undefined;
    private _isPlaying: boolean;

    constructor(
        songCallback: TrackCallback,
        trackEventHandler: HandlesTrackEvents
    ) {
        this.callback = songCallback;
        this.trackEventHandler = trackEventHandler;
        this._isPlaying = false;
    }

    isPlaying(): boolean {
        return this._isPlaying;
    }

    startPlayback(): TrackHandler {
        const audioContext = new AudioContext();
        const trackState = {
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
        this._isPlaying = true;
        this.trackHandler = walkTrack(this.callback, trackState, this, this.trackEventHandler);
        return this.trackHandler
    }

    stopPlayback() {
        this._isPlaying = false;
    };

    async waitForSongToFinish() {
        if (!this.trackHandler)
            throw new Error("Song has not been started yet");
        await this.trackHandler.waitForTrackToFinish();
        this.trackHandler = undefined;
    }
}


// TODO: track args
export function walkTrack(
    trackCallback: TrackCallback,
    trackState: TrackState,
    songHandler: SongHandler,
    trackEventHandler: HandlesTrackEvents) {
    const trackName = trackCallback.name;
    const subTrackHandlers: TrackHandler[] = [];

    function handleTrackEvent(trackEvent: SongTrackEvent) {
        trackEventHandler.handleTrackEvent(trackName, trackEvent, trackState.currentTokenID)
    }

    const trackRenderer: TrackRenderer = {
        trackState,

        async loadPreset(presetPath: string, config: object | undefined): Promise<InstrumentInstance> {
            const {
                instrument: instrumentPath,
                config: instrumentConfig
            }: InstrumentPreset = PresetLibrary.getPreset(presetPath)
            if (typeof config === "object")
                Object.assign(instrumentConfig, config);
            return trackRenderer.loadInstrument(instrumentPath, instrumentConfig);
        },
        async loadInstrument(instrumentPath: string | InstrumentLoader, config: object = {}): Promise<InstrumentInstance> {
            if (!songHandler.isPlaying())
                throw Error("Playback has ended");
            const context = trackState.destination.context;
            const startTime = context.currentTime;
            const instrumentLoader: InstrumentLoader = typeof instrumentPath === 'string' ? InstrumentLibrary.getInstrumentLoader(instrumentPath) : instrumentPath;
            trackState.instrument = await instrumentLoader(config, context);
            const duration = context.currentTime - startTime;
            if (duration) {
                console.log(`Adding ${duration}ms to song current time`)
                trackState.currentTime += duration;
            }
            return trackState.instrument;
        },
        playNote(noteString: string, velocity?: number, duration?: number): void {
            if (!songHandler.isPlaying())
                return;
            // if (trackState.durationDivisor)
            //     duration /= trackState.durationDivisor;
            if (typeof velocity !== "undefined" && trackState.velocityDivisor)
                velocity = velocity / trackState.velocityDivisor;
            const startTime = trackState.currentTime; //  + trackState.position;
            if (startTime < trackState.destination.context.currentTime) {
                console.warn("skipping note that occurs in the past: ", noteString, startTime, '<', trackState.destination.context.currentTime)
                return
            }
            let durationWithBPM;
            if (typeof duration === "undefined" && trackState.durationDefault)
                duration = trackState.durationDefault;
            if (typeof duration !== "undefined")
                durationWithBPM = duration * (60 / trackState.beatsPerMinute)
            // TODO: parse named notes / beats
            const noteEvent = new PlayNoteEvent(
                trackState.destination,
                noteString,
                // frequency,
                startTime,
                durationWithBPM,
                velocity
            )        // if (typeof duration === "string")
            //     duration = parseDurationString(duration, trackBPM);
            console.log("noteEvent", noteEvent, songHandler)
            if (typeof trackState.instrument !== "function")
                throw new Error(`Instrument not set for track ${trackName}: ${JSON.stringify(trackState)}`)
            const noteHandler = trackState.instrument(noteEvent);
            noteEvent.setHandler(noteHandler);
            handleTrackEvent(noteEvent);
        },
        setVariable(variablePath: string, variableValue: any): void {
            trackState[variablePath] = variableValue;
            handleTrackEvent(new SetVariableEvent(variablePath, variableValue));
        },

        startTrack(trackCallback: TrackCallback): void {
            const subTrackState: TrackState = {
                ...trackState,
                position: 0,
            }
            const subTrackHandler = walkTrack(trackCallback, subTrackState, songHandler, trackEventHandler)
            subTrackHandlers.push(subTrackHandler);
            handleTrackEvent(new StartTrackEvent(subTrackHandler));
        },
        async wait(duration: number): Promise<void> {
            if (!songHandler.isPlaying())
                return;
            // if (trackState.durationDivisor)
            //     duration /= trackState.durationDivisor;
            const durationWithBPM = duration * (60 / trackState.beatsPerMinute)
            const currentTime = trackState.currentTime;
            const waitTime = ((currentTime + durationWithBPM) - trackState.destination.context.currentTime) - trackState.bufferDuration;
            if (waitTime > 0) {
                // console.log(`Waiting ${waitTime}s`, trackState.currentTime, trackState.destination.context.currentTime, durationWithBPM);
                handleTrackEvent(new DurationEvent(trackState.destination, currentTime, durationWithBPM));
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));

            } else {
                // console.log(`Not Waiting ${waitTime}s`, trackState.currentTime, trackState.destination.context.currentTime, durationWithBPM);

            }
            trackState.position += duration;
            trackState.currentTime += durationWithBPM;
        },
        setCurrentToken(tokenID: number) {
            trackState.currentTokenID = tokenID
        }
    }

    const trackPromise = trackCallback(trackRenderer)
    const trackHandler: TrackHandler = {
        async waitForTrackToFinish(): Promise<void> {
            try {
                await trackPromise;
                await Promise.all(subTrackHandlers.map(handler => handler.waitForTrackToFinish()))
                // for (const subTrackHandler of subTrackHandlers) {
                //     await subTrackHandler.waitForTrackToFinish();
                // }
                const waitTime = ((trackState.currentTime) - trackState.destination.context.currentTime);
                // console.log('waitForTrackToFinish', waitTime, trackState.destination.context.currentTime, trackState.currentTime)
                if (waitTime > 0) {
                    // console.log(`Waiting for track to end ${waitTime}s`);
                    await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
                }
            } catch (e) {
                if (typeof (e as SongError).trackName !== "undefined")
                    throw e;
                console.error(e);
                throw {
                    message: (e as Error).message,
                    trackName,
                    tokenID: trackState.currentTokenID
                };
            }
        },
        getTrackName() {
            return trackName
        },
        getTrackState() {
            return trackState;
        }
    }
    return trackHandler;
}


export async function wait(delayMS: number) {
    if (delayMS > 0)
        await new Promise((resolve) => {
            setTimeout(resolve, delayMS)
        })
}

function calcDurationWithBPM(duration: number, beatsPerMinute: number) {
    return duration * (60 / beatsPerMinute);
}

// export function getRequireCallback(instruments: InstrumentBank) {
//     return function require(path: string) {
//         if (instruments[path])
//             return instruments[path];
//         throw new Error("Instrument not found: " + path);
//     }
// }

export const UnassignedInstrument: InstrumentInstance = (noteEvent: PlayNoteEvent) => {
    throw new Error(ERRORS.ERR_NO_INSTRUMENT);
}
