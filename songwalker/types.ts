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
    currentTime: number,
    beatsPerMinute: number,
    destination: AudioNode,
    instrument: InstrumentInstance,
    effects: Array<InstrumentInstance>,
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


export interface SongFunctions {
    wait: (this: TrackState, duration: number) => Promise<void>,
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

export type InstrumentLoader<Config> = (config: Config) => Promise<InstrumentInstance> | InstrumentInstance

/** Presets */

export type PresetBank<Config> = () => Generator<Preset<Config>> | AsyncGenerator<Preset<Config>>

export interface PresetBankBase {
    listPresets: PresetBank<any>,

    findPreset(presetID: string): Promise<Preset | null>,
}

// export type PresetType = 'instrument' | 'drum-kit' | 'effect'

export type Preset<Config = object> = {
    title: string,
    // type: PresetType,
    // alias?: string,
    loader: InstrumentLoader<Config>,
    config: Config
}
