import PolyphonyInstrument from "@songwalker/instruments/PolyphonyInstrument";
import {TrackState} from "@songwalker";
import OscillatorInstrument, {OscillatorInstrumentConfig} from "@songwalker/instruments/OscillatorInstrument";
import AudioBufferInstrument, {AudioBufferInstrumentConfig} from "@songwalker/instruments/AudioBufferInstrument";
import {Preset} from "@songwalker/types";
import {getDefaultTrackState} from "@songwalker/helper/songHelper";
import {generateRandomBuffer, testCommands} from "@songwalker/instruments/test/testHelper";

describe('Polyphony', () => {
    it('Polyphony plays C#4^0.1d1/2', async () => {
        const context = new AudioContext();
        const trackState: TrackState = {
            ...getDefaultTrackState(context.destination),
            destination: context.destination,
        }
        trackState.instrument = await PolyphonyInstrument.bind(trackState)({
            voices: [{
                title: 'osc',
                loader: OscillatorInstrument,
                config: {
                    mixer: 0.1,
                    type: 'sawtooth'
                }
            } as Preset<OscillatorInstrumentConfig>, {
                title: 'buffer',
                loader: AudioBufferInstrument,
                config: {
                    mixer: 0.1,
                    src: generateRandomBuffer(context)
                }
            } as Preset<AudioBufferInstrumentConfig>]
        })

        const {wait, playCommand} = testCommands(trackState);

        for (let i = 0; i < 8; i++) {
            playCommand('C#4^0.1@1/8')
            wait(1 / 8)
            playCommand('D#4^0.1@1/8')
            wait(1 / 8)
        }
    })
})
