import AudioBufferInstrument, {AudioBufferInstrumentConfig} from './AudioBufferInstrument'
import OscillatorInstrument, {OscillatorInstrumentConfig} from './OscillatorInstrument'
import PolyphonyInstrument, {PolyphonyInstrumentConfig} from './PolyphonyInstrument'
import SimpleReverbEffect from '@songwalker/instruments/effects/reverb/ReverbEffect'
import ReverbEffect, {ReverbEffectConfig} from '@songwalker/instruments/effects/reverb/ReverbEffect'
import {Preset} from "@songwalker/types";
import DelayEffect, {DelayEffectConfig} from "@songwalker/instruments/effects/delay/DelayEffect";

export {
    AudioBufferInstrument,
    OscillatorInstrument,
    PolyphonyInstrument,
    SimpleReverbEffect,
    InstrumentPresetBank
}

const InstrumentPresetBank = async function* () {
    yield {
        title: 'Oscillator',
        loader: OscillatorInstrument,
        config: {}
    } as Preset<OscillatorInstrumentConfig>
    yield {
        title: 'AudioBuffer',
        loader: AudioBufferInstrument,
        config: {}
    } as Preset<AudioBufferInstrumentConfig>
    yield {
        title: 'Polyphony',
        loader: PolyphonyInstrument,
        config: {}
    } as Preset<PolyphonyInstrumentConfig>

    /** Effects **/

    yield {
        title: 'Reverb',
        loader: ReverbEffect,
        config: {}
    } as Preset<ReverbEffectConfig>
    yield {
        title: 'Delay',
        loader: DelayEffect,
        config: {}
    } as Preset<DelayEffectConfig>
}
