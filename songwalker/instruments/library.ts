import {InstrumentPreset, PresetBank} from "@songwalker/types";
import OscillatorInstrument from "@songwalker/instruments/OscillatorInstrument";
import AudioBufferInstrument from "@songwalker/instruments/AudioBufferInstrument";
import PolyphonyInstrument from "@songwalker/instruments/PolyphonyInstrument";
import SongWalkerPresets from "@songwalker-presets";


const presetBanks: Array<PresetBank> = []


const PresetLibrary: PresetBank = {
    title: 'Default Library',
    async* listPresets(): AsyncGenerator<InstrumentPreset> {
        yield {
            title: 'Oscillator',
            instrument: OscillatorInstrument,
            config: {}
        }
        yield {
            title: 'AudioBuffer',
            instrument: AudioBufferInstrument,
            config: {}
        }
        yield {
            title: 'Polyphony',
            instrument: PolyphonyInstrument,
            config: {}
        }
        for (const presetBank of presetBanks) {
            yield* presetBank.listPresets()
        }
    },
}

export default PresetLibrary;


export function registerPresetBank(presetBank: PresetBank) {
    presetBanks.push(presetBank);
}

try {
    const SongWalkerPresets = require("@songwalker-presets");

    if (SongWalkerPresets.default) {
        SongWalkerPresets.default.registerAllPresetBanks()
    }
} catch (e) {
    console.error("Error loading preset library: ", e);
}
