import AudioBufferInstrument, {AudioBufferInstrumentConfig} from './AudioBufferInstrument'
import OscillatorInstrument, {OscillatorInstrumentConfig} from './OscillatorInstrument'
import PolyphonyInstrument, {PolyphonyInstrumentConfig} from './PolyphonyInstrument'
import SimpleReverbEffect from './effects/convolver/ReverbEffect'
import ReverbEffect, {ReverbEffectConfig} from './effects/convolver/ReverbEffect'
import {Preset} from "@songwalker/types";

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
}
