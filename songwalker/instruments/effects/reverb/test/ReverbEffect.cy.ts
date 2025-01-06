// noinspection DuplicatedCode

import {getSongPlayerState, playSong, renderSong} from "@songwalker/helper/songHelper";
import {AudioBufferInstrument} from "@songwalker/instruments";
import {songwalker} from "@songwalker/compiler/compiler";

const song = songwalker`
await loadPreset("Oscillator");
track.effects = [await loadPreset("Reverb", {duration: 10, decay: 0.5})];
for (let o = 2; o <= 6; o++) {
    for (let i = 0; i < 6; i++) {
        const note = String.fromCharCode(65 + i)
        execute(track, note + o, {duration: 1 / 9})
        1/8
    }
}
10
`

describe('ReverbEffect', () => {
    it('Oscillator with ReverbEffect', async () => {
        const {renderedBuffer} = await renderSong(song);
        console.log('renderedBuffer', renderedBuffer)

        const playerState = getSongPlayerState()
        const instrument = await AudioBufferInstrument(playerState, {
            src: renderedBuffer,
        })
        await playSong(songwalker`play`, {instrument})
    })
})
