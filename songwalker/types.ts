import {PlayNoteEvent} from "@songwalker/events";

export type TokenItem = {
    type: string,
    content: TokenList | string,
}

export type TokenItemOrString = TokenItem | string


export type TokenList = Array<TokenItemOrString>


export type TrackSourceMap = {
    [trackName: string]: string,
}

export type SongError = {
    message: string;
    tokenID?: number;
    trackName?: string;
}


export type TrackEventHandler = (trackEvent: SongTrackEvent, tokenID: number) => void;
export type SongState = {
    isPlaying: boolean,
    // trackEventHandler: HandlesTrackEvents
    // playFrequency: (trackState: TrackState, frequency: string, duration: number, ...args: any[]) => void;
};

export interface HandlesTrackEvents {
    handleTrackEvent(trackName: string, trackEvent: SongTrackEvent, tokenID: number): void;
}

export type SongHandler = {
    isPlaying(): boolean,
    startPlayback(): TrackHandler,
    stopPlayback(): void,
    // addEventCallback: (trackName: string, callback: TrackEventHandler) => void,
    waitForSongToFinish: () => Promise<void>
    // getRootTrackState: () => TrackState
}

export type TrackHandler = {
    waitForTrackToFinish: () => Promise<void>,
    getTrackState: () => TrackState,
    getTrackName: () => string
}

export type TrackState = {
    context: AudioContext,
    destination?: AudioDestinationNode,
    instrument: InstrumentInstance,
    // startTime: number,
    startTime: number,
    position: number,
    // noteDuration: number,
    // noteVelocity: number,
    beatsPerMinute: number,
    bufferDuration: number,
    // durationDivisor?: number,
    durationDefault?: number,
    velocityDivisor?: number,
    [key: string]: any
    // promise: Promise<void> | null
}

export type TrackRenderer = {
    trackState: TrackState,
    playNote: (noteString: string, duration?: number, velocity?: number) => void;
    loadInstrument: (instrumentPath: string | InstrumentLoader, config?: object) => Promise<InstrumentInstance>;
    loadPreset: (presetPath: string, config?: object) => Promise<InstrumentInstance>;
    setVariable: (variablePath: string, variableValue: any) => void;
    // getVariable: (variablePath: string) => any;
    startTrack: (trackCallback: TrackCallback) => void;
    wait: (duration: number) => Promise<void>;
    setCurrentToken: (tokenID: number) => void;
    // setCurrentInstrument: (instrument:Instrument) => void
    // promise: Promise<void> | null
}

export type TrackCallback = (trackRenderer: TrackRenderer) => Promise<void> | void;

export interface SongTrackEvent {
    waitForEventStart: () => Promise<void>,
    waitForEventEnd: () => Promise<void>,
}


// Instrument

// export interface InstrumentConfig {
//     // destination: AudioNode
// }

export interface NoteHandler {
    addEventListener(type: string, listener: (evt: Event) => void, options?: boolean | AddEventListenerOptions): void;

    stop(when?: number): void;
}

export type InstrumentInstance = (noteEvent: PlayNoteEvent) => NoteHandler;

export type InstrumentLoader = (config: object) => Promise<InstrumentInstance> | InstrumentInstance

// export type PresetList = {
//     [presetName: string]: (relativeURL: string) => InstrumentPreset
// }
// export type PresetBankList = {
//     [presetName: string]: PresetBank
// }

export interface PresetBank {
    title: string,

    getPreset(presetPath: string): InstrumentPreset,

    listPresets(presetPath: string): Generator<InstrumentPreset>

}


export type InstrumentPreset<Config = object> = {
    title?: string,
    instrument: string,
    config: Config
}

export type InstrumentBank = {
    getInstrumentLoader(instrumentPath: string): InstrumentLoader
}

// export type InstrumentList = {
//     [instrumentName: string]: InstrumentLoader
// }
//
// export type InstrumentPreset<IConfig> = {
//     instrument: string,
//     config: IConfig
// }