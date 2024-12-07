import {WebAudioFontLibrary} from "@songwalker-presets/WebAudioFont/WebAudioFontLibrary";
import {InstrumentPreset, TrackState} from "@songwalker/types";

describe('WebAudioFontLibrary', () => {

    const defaultTrackState = {
        beatsPerMinute: 240,
        bufferDuration: 0,
        currentTime: 0,
        noteDuration: 0,
        noteVelocity: 0,
        velocityDivisor: 1,
        instrument: () => undefined
    }
    it('lists all presets. load 3', async () => {
        let count = 0;
        const lastPresetByType: { [k: string]: InstrumentPreset } = {}
        const startTime = Date.now();

        for await (const preset of WebAudioFontLibrary({type: 'any', title: /.*/})) {
            console.log(preset);
            count++;
            if (preset.type && Math.random() > 0.8) {
                lastPresetByType[preset.type] = preset;
            }
        }
        console.log('Library iteration time:', `${Date.now() - startTime}ms`)
        expect(count).to.be.greaterThan(5000)
        expect(Object.values(lastPresetByType).length).to.be.eq(3)

        const context = new AudioContext();
        for (const preset of Object.values(lastPresetByType)) {
            const {config, loader} = preset;
            const trackState: TrackState = {
                ...defaultTrackState,
                destination: context.destination,
            }
            trackState.instrument = await loader.bind(trackState)(config)
        }

    })
})
