import PolyphonyInstrument from "@songwalker/instruments/PolyphonyInstrument";
import {TrackState} from "@songwalker";
import OscillatorInstrument, {OscillatorInstrumentConfig} from "@songwalker/instruments/OscillatorInstrument";
import AudioBufferInstrument, {AudioBufferInstrumentConfig} from "@songwalker/instruments/AudioBufferInstrument";
import {Preset} from "@songwalker/types";
import {getDefaultSongFunctions, getDefaultTrackState} from "@songwalker/helper/songHelper";
import {generateRandomBuffer} from "@songwalker/instruments/test/testHelper";

describe('Polyphony', () => {
    it('Polyphony plays C#4^10d1/2', async () => {
        const context = new AudioContext();
        const track: TrackState = {
            ...getDefaultTrackState(context.destination),
        }
        track.instrument = await PolyphonyInstrument(track, {
            voices: [{
                title: 'osc',
                loader: OscillatorInstrument,
                config: {
                    pan: -.5,
                    mixer: 0.1,
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

        const {wait, parseAndExecute: play} = getDefaultSongFunctions();

        for (let i = 0; i < 8; i++) {
            play(track, 'C#4^10@1/8')
            wait(track, 1 / 8)
            play(track, 'D#4^10@1/8')
            wait(track, 1 / 8)
        }
    })
})
