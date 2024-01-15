import {PlayNoteEvent} from "@songwalker/walker";
import {InstrumentInstance, InstrumentPreset} from "@songwalker/types";


export interface AudioBufferInstrumentConfig {
    title?: string,
    url: string,
    loopStart?: number,
    loopEnd?: number,
    envelope?: InstrumentPreset<object>
    // "ahdsr": ["Envelope", { "release": 100 }],
}

export type AudioBufferInstrumentPreset = InstrumentPreset<AudioBufferInstrumentConfig>

export default function AudioBufferInstrument(config: AudioBufferInstrumentConfig): InstrumentInstance {
    console.log('AudioBufferInstrument', config, config.title);
    // let activeAudioBuffers = [];

    // TODO?
    // return function(eventName, ...args) {
    return function (noteEvent: PlayNoteEvent) {

    }


}