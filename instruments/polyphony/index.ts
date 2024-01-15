import {PlayNoteEvent} from "@songwalker/walker";
import {InstrumentInstance, InstrumentPreset} from "@songwalker/types";


export interface PolyphonyInstrumentConfig<TConfig> {
    title: string,
    voices: Array<VoiceConfiguration<TConfig>>
}

export interface VoiceConfiguration<TConfig> {
    alias?: string
    keyRangeLow?: string,
    keyRangeHigh?: string,
    preset: InstrumentPreset<TConfig>
}

export type PolyphonyInstrumentPreset<TConfig> = InstrumentPreset<PolyphonyInstrumentConfig<TConfig>>

export default function PolyphonyInstrument(config: PolyphonyInstrumentConfig<object>): InstrumentInstance {
    console.log('PolyphonyInstrument', config, config.title);
    // let activePolyphonys = [];

    const aliases: { [key: string]: InstrumentPreset<any> } = {}
    const voices = config.voices.map(voice => {

    })

    // TODO?
    // return function(eventName, ...args) {
    return function (noteEvent: PlayNoteEvent) {
        if (aliases[noteEvent.value]) {
            // if alias is found, execute directly
        }
        for (let i = 0; i < voices.length; i++) {

        }
        return {}
    }


}