import {Preset, PresetBank, PresetBankBase} from "@songwalker/types";
import {InstrumentPresetBank} from "@songwalker/instruments/";


const presetBanks: Array<PresetBank> = [
    InstrumentPresetBank
]

const PresetLibrary: PresetBankBase = {
    async findPreset(presetID) {
        const filter = new RegExp(presetID);
        for await (const preset of PresetLibrary.listPresets()) {
            if (filter.test(preset.title))
                return preset;
        }
        return null;
    },
    async* listPresets(): AsyncGenerator<Preset> {
        for (const presetBank of presetBanks) {
            yield* presetBank()
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
