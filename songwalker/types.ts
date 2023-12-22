import {InstrumentInstance} from "@songwalker/walker";

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
    startPlayback: () => void,
    stopPlayback: () => void,
    // addEventCallback: (trackName: string, callback: TrackEventHandler) => void,
    waitForSongToFinish: () => Promise<void>
    getRootTrackState: () => TrackState
}

export type TrackHandler = {
    waitForTrackToFinish: () => Promise<void>,
    getTrackState: () => TrackState,
    getTrackName: () => string
}

export type TrackState = {
    destination: AudioDestinationNode,
    instrument: InstrumentInstance,
    // startTime: number,
    currentTime: number,
    position: number,
    noteDuration: number,
    noteVelocity: number,
    beatsPerMinute: number,
    bufferDuration: number,
    [key: string]: any
    // promise: Promise<void> | null
}

export interface SongTrackEvent {
    waitForEventStart: () => Promise<void>,
    waitForEventEnd: () => Promise<void>,
}