import {InstrumentPreset, PresetBank, PresetBankBase} from "@songwalker/types";
import OscillatorInstrument from "@songwalker/instruments/OscillatorInstrument";
import AudioBufferInstrument from "@songwalker/instruments/AudioBufferInstrument";
import PolyphonyInstrument from "@songwalker/instruments/PolyphonyInstrument";


const presetBanks: Array<PresetBank> = []


const PresetLibrary: PresetBankBase = {
    title: 'Default Library',
    async findPreset(filter) {
        for await (const preset of PresetLibrary.listPresets(filter)) {
            if (filter.type === 'any' || filter.type == preset.type) {
                if (filter.title.test(preset.title))
                    return preset;
            }
        }
        return null;
    },
    async* listPresets(filter): AsyncGenerator<InstrumentPreset> {
        yield {
            title: 'Oscillator',
            loader: OscillatorInstrument,
            config: {}
        }
        yield {
            title: 'AudioBuffer',
            loader: AudioBufferInstrument,
            config: {}
        }
        yield {
            title: 'Polyphony',
            loader: PolyphonyInstrument,
            config: {}
        }
        for (const presetBank of presetBanks) {
            yield* presetBank.listPresets(filter)
        }
    },
}

export default PresetLibrary;


export function registerPresetBank(presetBank: PresetBank) {
    presetBanks.push(presetBank);
}

try {
    require("@songwalker-presets");
} catch (e) {
    console.error("Error loading preset library: ", e);
}
