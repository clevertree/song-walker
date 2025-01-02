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
    duration?: number,
    pan?: number,
    destination?: AudioNode,
}

export interface CommandWithParams extends CommandParams {
    commandString: string,
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
    // bufferDuration: number,
    duration?: number,
    velocity?: number,
    velocityDivisor?: number,
    pan?: number,
    destination: AudioNode,
    instrument: InstrumentInstance,
    effects: Array<InstrumentInstance>,
    // parentTrack?: TrackState
    // startTime: number,
    // duration?: number,
    // durationDivisor?: number,
    // [key: string]: any
    // promise: Promise<void> | null
}

export type TrackStateOverrides = {
    [param in keyof TrackState]?: TrackState[param]
}


export interface SongWalkerState {
    context: BaseAudioContext
    rootTrackState: TrackState
    wait: (track: TrackState, duration: number) => boolean
    waitAsync: (track: TrackState, duration: number) => Promise<boolean>
    waitForTrackToFinish: (track: TrackState) => Promise<void>
    // waitForSongToFinish: () => Promise<void>
    loadPreset: (song: SongWalkerState,
                 presetID: string,
                 config: object) => Promise<InstrumentInstance>,
    execute: (track: TrackState, command: string, params?: CommandParams) => void
    parseAndExecute: (track: TrackState, commandString: string, additionalParams?: CommandParams) => void
    // executeCallback: (track: TrackState, callback: (...args: any[]) => any, ...args: any[]) => void
}

export type SongCallback = (songState: SongWalkerState) => Promise<void>;

export interface SongTrackEvent {
    waitForEventStart: () => Promise<void>,
    waitForEventEnd: () => Promise<void>,
}


/** @deprecated **/
export interface NoteHandler {
    addEventListener(type: string, listener: (evt: Event) => void, options?: boolean | AddEventListenerOptions): void;

    stop(when?: number): void;
}

/** Instrument */

// export type InstrumentInstance = (trackState: TrackState, command: string) => NoteHandler;
export type InstrumentInstance = (track: TrackState,
                                  command: CommandWithParams) => NoteHandler | void;

export type InstrumentLoader<Config = any> = (song: SongWalkerState, config: Config) => Promise<InstrumentInstance> | InstrumentInstance

/** Presets */

export type PresetBank = () => Generator<Preset> | AsyncGenerator<Preset>

export interface PresetBankBase {
    listPresets: PresetBank,

    findPreset(presetID: string | RegExp): Promise<Preset>,
}

// export type PresetType = 'instrument' | 'drum-kit' | 'effect'

export type Preset<Config = any> = {
    title: string,
    // type: PresetType,
    // alias?: string,
    loader: InstrumentLoader<Config>,
    config: Config
}
