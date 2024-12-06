// import {fetchWebAudioFontPlayer} from "@songwalker-presets/WebAudioFontLibrary";
import {WebAudioFontLibrary} from "@songwalker-presets/WebAudioFont/WebAudioFontLibrary";

describe('WebAudioFontLibrary', () => {

    it('lists all preset', async () => {
        let count = 0;
        for await (const preset of WebAudioFontLibrary.listPresets()) {
            console.log(preset);
            count++;
        }
        expect(count).to.be.greaterThan(5000)
    })
})
