import PolyphonyInstrument from "@songwalker/instruments/PolyphonyInstrument";
import OscillatorInstrument, {OscillatorInstrumentConfig} from "@songwalker/instruments/OscillatorInstrument";
import AudioBufferInstrument, {AudioBufferInstrumentConfig} from "@songwalker/instruments/AudioBufferInstrument";
import {Preset} from "@songwalker/types";
import {getSongRendererState} from "@songwalker/helper/songHelper";
import {generateRandomBuffer} from "@songwalker/instruments/test/testHelper";

describe('Polyphony', () => {
    it('Polyphony plays C#4d1/2', async () => {
        const context = new OfflineAudioContext({
            numberOfChannels: 2,
            length: 44100 * 8,
            sampleRate: 44100,
        });
        const songState = getSongRendererState(context);
        const {rootTrackState: track} = songState;
        track.instrument = await PolyphonyInstrument(songState, {
            voices: [{
                title: 'osc',
                loader: OscillatorInstrument,
                config: {
                    pan: -.5,
                    mixer: 0.8,
                    type: 'sawtooth'
                }
            } as Preset<OscillatorInstrumentConfig>, {
                title: 'buffer',
                loader: AudioBufferInstrument,
                config: {
                    pan: .5,
                    mixer: 0.8,
                    src: generateRandomBuffer(context)
                }
            } as Preset<AudioBufferInstrumentConfig>]
        })

        const {wait, execute} = songState;

        const duration = 1 / 8;
        for (let i = 0; i < 2; i++) {
            execute(track, 'C#4', {duration})
            wait(track, duration)
            execute(track, 'D#4', {duration})
            wait(track, duration)
        }
    })
})
