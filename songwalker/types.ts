export type TokenItem = [name: string, content: TokenList | string]

// export type TokenItemOrString = TokenItem | string


export type TokenList = Array<TokenItem | string>


export type SongError = {
    message: string;
    tokenID?: number;
    trackName?: string;
}

export interface CommandParams {
    velocity?: number,
    duration?: number
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


// export type TrackEventHandler = (trackEvent: SongTrackEvent, tokenID: number) => void;
// export type SongState = {
//     isPlaying: boolean,
//     // trackEventHandler: HandlesTrackEvents
//     // playFrequency: (trackState: TrackState, frequency: string, duration: number, ...args: any[]) => void;
// };

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
    currentTime: number,    // Actual time
    position: number,      // Positional time (in beats)
    beatsPerMinute: number,
    destination: AudioNode,
    instrument: InstrumentInstance,
    effects: Array<InstrumentInstance>,
    duration?: number,
    velocity?: number,
    velocityDivisor?: number,
    // startTime: number,
    // duration?: number,
    bufferDuration?: number,
    // durationDivisor?: number,
    // [key: string]: any
    // promise: Promise<void> | null
}

export interface CommandState extends TrackState {
    command: string
}


export interface SongFunctions {
    wait: (this: TrackState, duration: number) => boolean,
    waitAsync: (this: TrackState, duration: number) => Promise<boolean>,
    loadPreset: (this: TrackState,
                 presetID: string,
                 config: object) => Promise<InstrumentInstance>,
    playCommand: (this: TrackState, command: string, props?: CommandParams) => void
}

export type SongCallback = (this: TrackState, functions: SongFunctions) => Promise<void>;

export interface SongTrackEvent {
    waitForEventStart: () => Promise<void>,
    waitForEventEnd: () => Promise<void>,
}


/** Instrument */

export interface NoteHandler {
    addEventListener(type: string, listener: (evt: Event) => void, options?: boolean | AddEventListenerOptions): void;

    stop(when?: number): void;
}


// export type InstrumentInstance = (trackState: TrackState, command: string) => NoteHandler;
export type InstrumentInstance = (this: TrackState,
                                  commandState: CommandState) => NoteHandler | void;

export type InstrumentLoader<Config = any> = (config: Config) => Promise<InstrumentInstance> | InstrumentInstance

/** Presets */

export type PresetBank = () => Generator<Preset<any>> | AsyncGenerator<Preset<any>>

export interface PresetBankBase {
    listPresets: PresetBank,

    findPreset(presetID: string): Promise<Preset<any>>,
}

// export type PresetType = 'instrument' | 'drum-kit' | 'effect'

export type Preset<Config> = {
    title: string,
    // type: PresetType,
    // alias?: string,
    loader: InstrumentLoader<Config>,
    config: Config
}
