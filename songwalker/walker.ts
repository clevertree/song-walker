import {
    HandlesTrackEvents,
    InstrumentInstance,
    InstrumentLoader,
    InstrumentPreset,
    SongError,
    SongHandler,
    SongTrackEvent,
    TrackCallback,
    TrackRenderer,
    TrackState
} from "./types";
import InstrumentLibrary from "./instruments/library";
import PresetLibrary from "@samples";
import {DurationEvent, PlayNoteEvent, SetVariableEvent, StartTrackEvent} from "./events";

const DEFAULT_BUFFER_DURATION = .1;
// const START_DELAY = .1;
const DEFAULT_BPM = 120;
const DEFAULT_NOTE_DURATION = 1;
const DEFAULT_NOTE_VELOCITY = 1;


export class SongWalker implements SongHandler {
    // private readonly rootTrackCallback: TrackCallback;
    public readonly trackEventHandler: HandlesTrackEvents;
    public readonly rootTrackHandler: TrackWalker;
    private _isPlaying: boolean;
    context: AudioContext;

    constructor(
        songCallback: TrackCallback,
        trackEventHandler: HandlesTrackEvents
    ) {
        this.trackEventHandler = trackEventHandler;
        this.context = new AudioContext();
        this._isPlaying = true;
        this.rootTrackHandler = new TrackWalker(this, songCallback, {});
    }

    isPlaying(): boolean {
        return this._isPlaying;
    }

    stopPlayback() {
        this._isPlaying = false;
    };

    async waitForSongToFinish() {
        if (!this.rootTrackHandler)
            throw new Error("Song has not been started yet");
        await this.rootTrackHandler.waitForTrackToFinish();
    }

}

// TODO: track args

class TrackWalker implements TrackRenderer {
    // private handleTrackEvent: (trackEvent: SongTrackEvent) => void;
    readonly getTrackName: () => string;
    readonly getTrackState: () => TrackState;
    readonly playNote: (noteString: string, duration?: number, velocity?: number) => void;
    readonly loadInstrument: (instrumentPath: string | InstrumentLoader, config?: object) => Promise<InstrumentInstance>;
    readonly loadPreset: (presetPath: string, config?: object) => Promise<InstrumentInstance>;
    readonly setVariable: (variablePath: string, variableValue: any) => void;
    // getVariable: (variablePath: string) => any;
    readonly startTrack: (trackCallback: TrackCallback) => void;
    readonly waitUntil: (duration: number) => Promise<void>;
    readonly setCurrentToken: (tokenID: number) => void;
    readonly waitForTrackToFinish: () => Promise<void>;


    constructor(
        songInstance: SongWalker,
        trackCallback: TrackCallback,
        trackState: TrackState,
        position: number = 0,
        currentTime: number = 0
    ) {
        const THIS = this;
        const audioContext = songInstance.context;
        const trackName = trackCallback.name;
        const subTrackHandlers: TrackWalker[] = [];
        this.getTrackName = function () {
            return trackName;
        }
        let currentTokenID = 0;
        const handleTrackEvent = function (trackEvent: SongTrackEvent) {
            songInstance.trackEventHandler.handleTrackEvent(trackName, trackEvent, currentTokenID)
        }
        this.getTrackState = function () {
            return trackState;
        }
        this.loadPreset = async function (presetPath: string, config: object | undefined): Promise<InstrumentInstance> {
            const {
                instrument: instrumentPath,
                config: instrumentConfig
            }: InstrumentPreset = PresetLibrary.getPreset(presetPath)
            if (typeof config === "object")
                Object.assign(instrumentConfig, config);
            return THIS.loadInstrument(instrumentPath, instrumentConfig);
        }

        this.loadInstrument = async function (instrumentPath: string | InstrumentLoader, config: object = {}): Promise<InstrumentInstance> {
            if (!songInstance.isPlaying())
                throw Error("Playback has ended");
            const startTime = audioContext.currentTime;
            const instrumentLoader: InstrumentLoader = typeof instrumentPath === 'string' ? InstrumentLibrary.getInstrumentLoader(instrumentPath) : instrumentPath;
            trackState.instrument = await instrumentLoader(config);
            const duration = audioContext.currentTime - startTime;
            if (duration) {
                console.log(`${duration}ms added to track currentTime`)
                currentTime += duration;
            }
            return trackState.instrument;
        }
        this.playNote = function (noteString: string, velocity?: number, duration?: number): void {
            if (!songInstance.isPlaying())
                return;
            // if (trackState.durationDivisor)
            //     duration /= trackState.durationDivisor;
            if (typeof velocity !== "undefined" && trackState.velocityDivisor)
                velocity = velocity / trackState.velocityDivisor;
            const startTime = trackState.currentTime; //  + trackState.position;
            if (startTime < audioContext.currentTime) {
                console.warn("skipping note that occurs in the past: ", noteString, startTime, '<', audioContext.currentTime)
                return
            }
            let durationWithBPM;
            if (typeof duration === "undefined" && trackState.duration)
                duration = trackState.duration;
            if (typeof duration !== "undefined")
                durationWithBPM = calcDurationWithBPM(duration, trackState.beatsPerMinute || DEFAULT_BPM)
            // TODO: parse named notes / beats
            const destination = trackState.destination || audioContext.destination;
            const noteEvent = new PlayNoteEvent(
                destination,
                noteString,
                // frequency,
                startTime,
                durationWithBPM,
                velocity
            )        // if (typeof duration === "string")
            //     duration = parseDurationString(duration, trackBPM);
            // console.log("noteEvent", noteEvent, songHandler)
            if (typeof trackState.instrument !== "function")
                throw new Error(`Instrument not set for track ${trackName}: ${JSON.stringify(trackState)}`)
            const noteHandler = trackState.instrument(noteEvent);
            noteEvent.setHandler(noteHandler);
            handleTrackEvent(noteEvent)
        }
        this.setVariable = function (variablePath: string, variableValue: any): void {
            trackState[variablePath] = variableValue;
            const varEvent = new SetVariableEvent(variablePath, variableValue);
            handleTrackEvent(varEvent)
        }

        this.startTrack = function (trackCallback: TrackCallback, position: number = 0): void {
            const subTrackState: TrackState = {
                ...trackState,
            }
            const subTrackHandler = new TrackWalker(songInstance, trackCallback, subTrackState, position, currentTime)
            subTrackHandlers.push(subTrackHandler);
            handleTrackEvent(new StartTrackEvent(subTrackHandler));
        }
        this.waitUntil = async function (duration: number): Promise<void> {
            if (!songInstance.isPlaying())
                return;
            // if (trackState.durationDivisor)
            //     duration /= trackState.durationDivisor;
            const bufferDuration = trackState.bufferDuration || DEFAULT_BUFFER_DURATION;
            const durationWithBPM = calcDurationWithBPM(duration, trackState.beatsPerMinute || DEFAULT_BPM)
            const waitTime = ((currentTime + durationWithBPM) - audioContext.currentTime) - bufferDuration;
            // const destination = trackState.destination || trackState.context.destination;
            if (waitTime > 0) {
                // console.log(`Waiting ${waitTime}s`, trackState.currentTime, trackState.destination.context.currentTime, durationWithBPM);
                handleTrackEvent(new DurationEvent(trackState.context, currentTime, durationWithBPM));
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));

            } else {
                // console.log(`Not Waiting ${waitTime}s`, trackState.currentTime, trackState.destination.context.currentTime, durationWithBPM);

            }
            position += duration;
            currentTime += durationWithBPM;
        }
        this.setCurrentToken = function (tokenID: number) {
            currentTokenID = tokenID
        }

        const trackPromise = trackCallback(this)
        this.waitForTrackToFinish = async function (): Promise<void> {
            try {
                await trackPromise;
                await Promise.all(subTrackHandlers.map(handler => handler.waitForTrackToFinish()))
                // for (const subTrackHandler of subTrackHandlers) {
                //     await subTrackHandler.waitForTrackToFinish();
                // }
                const waitTime = ((currentTime) - audioContext.currentTime);
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
                    tokenID: currentTokenID
                };
            }
        }

    }

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
//
// export const UnassignedInstrument: InstrumentInstance = (noteEvent: PlayNoteEvent) => {
//     throw new Error(ERRORS.ERR_NO_INSTRUMENT);
// }
