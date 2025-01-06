import {renderSong} from "@songwalker/helper/renderHelper";
import {songwalker} from "@songwalker/compiler/compiler";
import {getSongPlayerState, playSong} from "@songwalker/helper/songHelper";
import AudioBufferInstrument from "../AudioBufferInstrument";

const song = songwalker`
await loadPreset('Oscillator', {
    type: 'sine'
})
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
    it('Oscillator plays C#4d1/2', async () => {
        const {renderedBuffer} = await renderSong(song);
        console.log('renderedBuffer', renderedBuffer)

        const playerState = getSongPlayerState()
        const instrument = await AudioBufferInstrument(playerState, {
            src: renderedBuffer,
        })
        await playSong(songwalker`play`, {instrument})
    })
})
