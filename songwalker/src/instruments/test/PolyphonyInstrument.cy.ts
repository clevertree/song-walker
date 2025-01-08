import {PolyphonyInstrumentConfig} from "@songwalker/instruments/PolyphonyInstrument";
import OscillatorInstrument, {OscillatorInstrumentConfig} from "@songwalker/instruments/OscillatorInstrument";
import AudioBufferInstrument, {AudioBufferInstrumentConfig} from "@songwalker/instruments/AudioBufferInstrument";
import {Preset} from "@songwalker/types";
import {generateRandomBuffer} from "@songwalker/instruments/test/testHelper";
import {renderSong} from "@songwalker/helper/renderHelper";
import {songwalker} from "@songwalker/compiler/compiler";
import {getSongPlayerState, playSong} from "@songwalker/helper/songHelper";

const song = songwalker`
await loadPreset('Polyphony', track.custom.polyphonyConfig);

for (let o = 2; o <= 6; o++) {
    for (let i = 0; i < 6; i++) {
        const note = String.fromCharCode(65 + i)
        execute(track, note + o, {duration: 1 / 9})
        1/8
    }
}
D4 1 C4 1
`

describe('Polyphony', () => {
    it('Polyphony plays C#4d1/2', async () => {
        const polyphonyConfig: PolyphonyInstrumentConfig = {
            voices: [{
                title: 'osc',
                loader: OscillatorInstrument,
                config: {
                    pan: -.5,
                    mixer: 0.8,
                    type: 'square'
                }
            } as Preset<OscillatorInstrumentConfig>, {
                title: 'buffer',
                loader: AudioBufferInstrument,
                config: {
                    pan: .5,
                    mixer: 0.8,
                    src: generateRandomBuffer(new AudioContext())
                }
            } as Preset<AudioBufferInstrumentConfig>]
        };
        const {renderedBuffer} = await renderSong(song, {
            custom: {polyphonyConfig}
        });
        console.log('renderedBuffer', renderedBuffer)

        const playerState = getSongPlayerState()
        const instrument = await AudioBufferInstrument(playerState, {
            src: renderedBuffer,
        })
        await playSong(songwalker`play`, {instrument})
    })
})
