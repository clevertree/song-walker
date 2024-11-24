import {parseNote, TrackState} from "@songwalker";
import {ParsedNote} from "@songwalker/types";

export interface KeyRangeConfig {
    keyRangeLow?: string,
    keyRangeHigh?: string,
}

type FilterCallback = (noteInfo: ParsedNote, trackState: TrackState) => boolean;

export function configFilterByKeyRange({
                                           keyRangeHigh,
                                           keyRangeLow
                                       }: KeyRangeConfig, callback: FilterCallback): FilterCallback {
    let filterCallback = callback;
    if (typeof keyRangeLow !== 'undefined') {
        const keyRangeLowFrequency = parseNote(keyRangeLow).frequency;
        const refCallback = filterCallback
        filterCallback = (noteInfo, trackState) => {
            if (keyRangeLowFrequency > noteInfo.frequency) {
                return true;
            }
            return refCallback(noteInfo, trackState)
        }
    }
    if (typeof keyRangeHigh !== 'undefined') {
        const keyRangeHighFrequency = parseNote(keyRangeHigh).frequency;
        const refCallback = filterCallback
        filterCallback = (noteInfo, trackState) => {
            if (keyRangeHighFrequency < noteInfo.frequency) {
                return true;
            }
            return refCallback(noteInfo, trackState)
        }
    }
    return filterCallback;
}

export function configFilterByCurrentTime(): FilterCallback {
    return (noteInfo: ParsedNote, trackState: TrackState) => {
        let {
            destination: {
                context: audioContext
            },
            currentTime,
        } = trackState;
        if (currentTime < audioContext.currentTime) {
            console.warn("skipping note that occurs in the past: ",
                noteInfo.note, currentTime, '<', audioContext.currentTime)
            return true
        }
        return false;
    }
}
