import {PlayNoteEvent} from "@songwalker/walker";
import {InstrumentInstance, InstrumentPreset} from "@songwalker/types";
import {AudioBufferInstrumentConfig} from "@songwalker/instruments/AudioBuffer";


export interface AudioBufferDynamicInstrumentConfig extends AudioBufferInstrumentConfig {
    transpose: number,
}

export type AudioBufferDynamicInstrumentPreset = InstrumentPreset<AudioBufferDynamicInstrumentConfig>

export default function AudioBufferDynamicInstrument(config: AudioBufferDynamicInstrumentConfig): InstrumentInstance {
    console.log('AudioBufferDynamicInstrument', config, config.title);
    // let activeAudioBuffers = [];

    // TODO?
    // return function(eventName, ...args) {
    return function (noteEvent: PlayNoteEvent) {

    }


}