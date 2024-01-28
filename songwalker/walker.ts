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
} from "./types";
import InstrumentLibrary from "./instruments/library";
import PresetLibrary from "@samples";
import {DurationEvent, PlayNoteEvent, SetVariableEvent, StartTrackEvent} from "./events";

const BUFFER_DURATION = .1;
// const START_DELAY = .1;
const DEFAULT_BPM = 120;
const DEFAULT_NOTE_DURATION = 1;
const DEFAULT_NOTE_VELOCITY = 1;


export class SongPlayer implements SongHandler {
    private readonly callback: TrackCallback;
    private readonly trackEventHandler: HandlesTrackEvents;
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
        const trackState: TrackState = {
            context: audioContext,
            instrument: UnassignedInstrument,
            startTime: audioContext.currentTime,
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
            const context = trackState.context;
            // await context.suspend()
            const startTime = context.currentTime;
            const instrumentLoader: InstrumentLoader = typeof instrumentPath === 'string' ? InstrumentLibrary.getInstrumentLoader(instrumentPath) : instrumentPath;
            trackState.instrument = await instrumentLoader(config);
            // await context.resume()
            const duration = context.currentTime - startTime;
            if (duration) {
                console.log(`${duration}ms added to song current time`)
                trackState.startTime += duration;
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
            const startTime = trackState.startTime; //  + trackState.position;
            if (startTime < trackState.context.currentTime) {
                console.warn("skipping note that occurs in the past: ", noteString, startTime, '<', trackState.context.currentTime)
                return
            }
            let durationWithBPM;
            if (typeof duration === "undefined" && trackState.durationDefault)
                duration = trackState.durationDefault;
            if (typeof duration !== "undefined")
                durationWithBPM = duration * (60 / trackState.beatsPerMinute)
            // TODO: parse named notes / beats
            const destination = trackState.destination || trackState.context.destination;
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
            const currentTime = trackState.startTime;
            const waitTime = ((currentTime + durationWithBPM) - trackState.context.currentTime) - trackState.bufferDuration;
            const destination = trackState.destination || trackState.context.destination;
            if (waitTime > 0) {
                // console.log(`Waiting ${waitTime}s`, trackState.currentTime, trackState.destination.context.currentTime, durationWithBPM);
                handleTrackEvent(new DurationEvent(trackState.context, currentTime, durationWithBPM));
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));

            } else {
                // console.log(`Not Waiting ${waitTime}s`, trackState.currentTime, trackState.destination.context.currentTime, durationWithBPM);

            }
            trackState.position += duration;
            trackState.startTime += durationWithBPM;
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
                const waitTime = ((trackState.startTime) - trackState.context.currentTime);
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
