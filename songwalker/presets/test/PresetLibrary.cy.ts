import {WebAudioFontLibrary} from "@songwalker-presets/WebAudioFont/WebAudioFontLibrary";
import PresetLibrary from "@songwalker/presets/PresetLibrary";

describe('WebAudioFontLibrary', () => {
    it('load presets', async () => {
        let preset = await PresetLibrary.findPreset(/^JCLive/i)
        expect(preset.title).to.include('JCLive');
        preset = await PresetLibrary.findPreset(/Grand Piano$/i)
        expect(preset.title).to.include('Grand Piano');
        preset = await PresetLibrary.findPreset(/Stratocaster.*Guitar/i)
        expect(preset.title).to.include('Stratocaster');
    })
})
