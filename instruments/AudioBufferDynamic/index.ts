import {PlayNoteEvent} from "@songwalker/walker";
import {InstrumentInstance, InstrumentPreset} from "@songwalker/types";
import AudioBufferInstrument, {AudioBufferInstrumentConfig} from "@instruments/AudioBuffer";
import {parseFrequencyString} from "@songwalker/note";


export interface AudioBufferDynamicInstrumentConfig extends AudioBufferInstrumentConfig {
    frequencyRoot: number | string | null,
}

export type AudioBufferDynamicInstrumentPreset = InstrumentPreset<AudioBufferDynamicInstrumentConfig>

export default function AudioBufferDynamicInstrument(config: AudioBufferDynamicInstrumentConfig): InstrumentInstance {
    const audioBufferInstrument = AudioBufferInstrument(config);
    console.log('AudioBufferDynamicInstrument', config, config.title);

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
