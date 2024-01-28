import {InstrumentInstance, InstrumentLoader, NoteHandler, SongTrackEvent, TrackHandler} from "@songwalker/types";
import {wait} from "@songwalker/walker";
import {matchFrequencyString, parseFrequencyString} from "@songwalker/note";

export class DurationEvent implements SongTrackEvent {
    context: AudioContext;
    startTime: number;
    duration: number;

    constructor(context: AudioContext, startTime: number, duration: number) {
        this.context = context;
        this.startTime = startTime;
        this.duration = duration;
    }

    async waitForEventStart() {
        await wait((this.startTime - this.context.currentTime) * 1000)
    }

    async waitForEventEnd() {
        await wait((this.startTime - this.context.currentTime + this.duration) * 1000)
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