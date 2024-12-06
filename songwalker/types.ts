export type TokenItem = [name: string, content: TokenList | string]

// export type TokenItemOrString = TokenItem | string


export type TokenList = Array<TokenItem | string>


/** @deprecated **/
export type TrackSourceMap = {
    [trackName: string]: string,
}

export type SongError = {
    message: string;
    tokenID?: number;
    trackName?: string;
}

export interface CommandParams {
    noteVelocity?: number,
    noteDuration?: number
}

export type ParsedParams = {
    [paramName in keyof CommandParams]?: string;
}

export interface CommandParamsAliases {
    '@': keyof CommandParams,
    '^': keyof CommandParams
}

export interface ParsedCommand {
    command: string,
    params: CommandParams
}

export interface ParsedNote {
    note: string,
    octave: number,
    frequency: number,
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
    // startPlayback(): TrackHandler,
    stopPlayback(): void,
    // addEventCallback: (trackName: string, callback: TrackEventHandler) => void,
    waitForSongToFinish: () => Promise<void>
    // getRootTrackState: () => TrackState
}

export interface TrackState {
    // context: AudioContext,
    currentTime: number,
    beatsPerMinute: number,
    destination: AudioDestinationNode,
    instrument: InstrumentInstance,
    noteDuration?: number,
    noteVelocity?: number,
    velocityDivisor?: number,
    // startTime: number,
    // duration?: number,
    // position?: number,
    bufferDuration?: number,
    // durationDivisor?: number,
    // [key: string]: any
    // promise: Promise<void> | null
}

export interface CommandState extends TrackState {
    command: string
}

// export type NoteRenderers = {
//     [noteString: string]: (duration?: number, velocity?: number) => void;
// }

// export type TrackRenderer = {
//     getTrackName: () => string
//     getTrackState: () => TrackState,
//     playNote: (noteString: string, duration?: number, velocity?: number) => void;
//     loadInstrument: (instrumentPath: string | InstrumentLoader, config?: object) => Promise<InstrumentInstance>;
//     // loadPreset: (presetPath: string, config?: object) => Promise<InstrumentInstance>;
//     /* @depreciated */
//     setVariable: (variablePath: string, variableValue: any) => void;
//     // getVariable: (variablePath: string) => any;
//     startTrack: (trackCallback: TrackCallback) => void;
//     waitUntil: (duration: number) => Promise<void>;
//     setCurrentToken: (tokenID: number) => void;
//     waitForTrackToFinish: () => Promise<void>,
//     // notes: NoteRenderers
//     // setCurrentInstrument: (instrument:Instrument) => void
//     // promise: Promise<void> | null
// }

// export type TrackCallback = (trackRenderer: TrackRenderer) => Promise<void> | void;


export interface SongFunctions {
    wait: (this: TrackState, duration: number) => Promise<void>,
    loadInstrument: (this: TrackState,
                     instrumentPath: string,
                     config: object) => Promise<InstrumentInstance>,
    playCommand: (this: TrackState, command: string, props?: CommandParams) => void
}

export type SongCallback = (this: TrackState, functions: SongFunctions) => Promise<void>;

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


// export type InstrumentInstance = (trackState: TrackState, command: string) => NoteHandler;
export type InstrumentInstance = (this: TrackState,
                                  commandState: CommandState) => NoteHandler | void;

export type InstrumentLoader = (config?: any) => Promise<InstrumentInstance> | InstrumentInstance

// export type PresetList = {
//     [presetName: string]: (relativeURL: string) => InstrumentPreset
// }
// export type PresetBankList = {
//     [presetName: string]: PresetBank
// }

export interface PresetBank {
    title: string,

    // getPreset(presetPath: string): InstrumentPreset | Promise<InstrumentPreset>,

    listPresets(): Generator<InstrumentPreset> | AsyncGenerator<InstrumentPreset>

}

export type InstrumentPresetType = 'default' | 'percussion' | 'drum-kit'

export type InstrumentPreset<Config = object> = {
    title?: string,
    type?: InstrumentPresetType,
    alias?: string,
    instrument: InstrumentLoader,
    config: Config
}

// export type InstrumentBank = {
//     getInstrumentLoader(instrumentPath: string): InstrumentLoader
// }

// export type InstrumentList = {
//     [instrumentName: string]: InstrumentLoader
// }
//
// export type InstrumentPreset<IConfig> = {
//     instrument: string,
//     config: IConfig
// }
