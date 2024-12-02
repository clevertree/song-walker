import {parseNote} from "@songwalker";
import {CommandState, ParsedNote} from "@songwalker/types";

export interface KeyRangeConfig {
    keyRangeLow?: string,
    keyRangeHigh?: string,
}

type FilterCallback = (noteInfo: ParsedNote, commandState: CommandState) => boolean;

export function configFilterByKeyRange({
                                           keyRangeHigh,
                                           keyRangeLow
                                       }: KeyRangeConfig, callback: FilterCallback = () => false): FilterCallback {
    let filterCallback = callback;
    if (typeof keyRangeLow !== 'undefined') {
        const keyRangeLowFrequency = parseNote(keyRangeLow).frequency;
        const refCallback = filterCallback
        filterCallback = (noteInfo, commandState) => {
            if (keyRangeLowFrequency > noteInfo.frequency) {
                return true;
            }
            return refCallback(noteInfo, commandState)
        }
    }
    if (typeof keyRangeHigh !== 'undefined') {
        const keyRangeHighFrequency = parseNote(keyRangeHigh).frequency;
        const refCallback = filterCallback
        filterCallback = (noteInfo, commandState) => {
            if (keyRangeHighFrequency < noteInfo.frequency) {
                return true;
            }
            return refCallback(noteInfo, commandState)
        }
    }
    return filterCallback;
}

// export function configFilterByCurrentTime(): FilterCallback {
//     return (noteInfo: ParsedNote, commandState: CommandState) => {
//         let {
//             destination: {
//                 context: audioContext
//             },
//             currentTime,
//         } = commandState;
//         if (currentTime < audioContext.currentTime) {
//             console.warn("skipping note that occurs in the past: ",
//                 noteInfo.note, currentTime, '<', audioContext.currentTime)
//             return true
//         }
//         return false;
//     }
// }
