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
    it('lists all preset. load 3', async () => {
        let count = 0;
        const lastPresetByType: { [k: string]: InstrumentPreset } = {}
        for await (const preset of WebAudioFontLibrary.listPresets()) {
            console.log(preset);
            count++;
            if (preset.type && Math.random() > 0.8) {
                lastPresetByType[preset.type] = preset;
            }
        }
        expect(count).to.be.greaterThan(5000)
        expect(Object.values(lastPresetByType).length).to.be.eq(3)
        const context = new AudioContext();
        for (const preset of Object.values(lastPresetByType)) {
            const {config, instrument} = preset;
            const trackState: TrackState = {
                ...defaultTrackState,
                destination: context.destination,
            }
            trackState.instrument = await instrument.bind(trackState)(config)
        }
    })
})
