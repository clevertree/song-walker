import {WebAudioFontLibrary} from "@songwalker-presets/WebAudioFont/WebAudioFontLibrary";
import PresetLibrary from "@songwalker/presets/PresetLibrary";

describe('WebAudioFontLibrary', () => {

    const defaultTrackState = {
        beatsPerMinute: 240,
        bufferDuration: 0,
        currentTime: 0,
        duration: 0,
        velocity: 0,
        velocityDivisor: 1,
        instrument: () => undefined
    }
    it('load presets', async () => {
        const percPreset = await PresetLibrary.findPreset({type: 'percussion', title: /.*/})
        expect(percPreset?.type).to.eq('percussion');
    })
})
