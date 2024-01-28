import {InstrumentInstance} from "@songwalker/types";
import AudioBufferInstrument, {AudioBufferInstrumentConfig} from "../index";
import {parseFrequencyString} from "@songwalker/note";
import {PlayNoteEvent} from "@songwalker/events";


export interface AudioBufferDynamicInstrumentConfig extends AudioBufferInstrumentConfig {
    frequencyRoot: number | string | null,
}


export default async function AudioBufferDynamicInstrument(config: AudioBufferDynamicInstrumentConfig): Promise<InstrumentInstance> {
    // console.log('AudioBufferDynamicInstrument', config, config.title);
    const audioBufferInstrument = await AudioBufferInstrument(config);

    let frequencyRoot = getFrequencyRoot(config.frequencyRoot)

    return function (noteEvent: PlayNoteEvent) {
        const audioBuffer = audioBufferInstrument(noteEvent) as AudioBufferSourceNode;
        const frequency = parseFrequencyString(noteEvent.value)
        // Playback Rate
        audioBuffer.playbackRate.value = frequency / frequencyRoot;
        return audioBuffer;
    }

}


function getFrequencyRoot(frequencyRoot: number | string | null) {
    if (typeof frequencyRoot === "string")
        return parseFrequencyString(frequencyRoot);
    return frequencyRoot || 220;
}
