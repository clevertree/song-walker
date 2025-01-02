import {WebAudioFontLibrary} from "@songwalker-presets/WebAudioFont/WebAudioFontLibrary";
import {Preset} from "@songwalker/types";
import {getDefaultSongWalkerState} from "@songwalker/helper/songHelper";

describe('WebAudioFontLibrary', () => {
    it('lists all presets. load 3', async () => {
        let count = 0;
        const startTime = Date.now();
        const randomPresets: Preset[] = [];

        for await (const preset of WebAudioFontLibrary()) {
            count++;
            if (Math.random() > 0.99 && randomPresets.length < 3) {
                console.log(preset);
                randomPresets.push(preset);
            }
        }
        console.log('Library iteration time:', `${Date.now() - startTime}ms`)
        expect(count).to.be.greaterThan(5000)

        const context = new AudioContext();
        const songState = getDefaultSongWalkerState(context);
        for (const preset of randomPresets) {
            const {config, loader} = preset;
            songState.rootTrackState.instrument = await loader(songState, config)
        }

    })
})
