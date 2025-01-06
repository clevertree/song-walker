// noinspection DuplicatedCode

import {getSongPlayerState, playSong} from "@songwalker/helper/songHelper";
import {songwalker} from "@songwalker/compiler/compiler";
import {AudioBufferInstrument} from "@songwalker/instruments";
import {renderSong} from "@songwalker/helper/renderHelper";

const song = songwalker`
await loadPreset("Oscillator");
track.effects = [await loadPreset("Delay", {duration: 1, feedback: 0.5})];
for (let o = 2; o <= 6; o++) {
    for (let i = 0; i < 6; i++) {
        const note = String.fromCharCode(65 + i)
        execute(track, note + o, {duration: 1 / 9})
        1/8
    }
}
D4 1 C4 1
`

describe('Oscillator', () => {
    it('Oscillator with Delay', async () => {
        const {renderedBuffer} = await renderSong(song);
        console.log('renderedBuffer', renderedBuffer)

        const playerState = getSongPlayerState()
        const instrument = await AudioBufferInstrument(playerState, {
            src: renderedBuffer,
        })
        await playSong(songwalker`play`, {instrument})
    })
})
