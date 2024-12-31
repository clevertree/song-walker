import AudioBufferInstrument from "@songwalker/instruments/AudioBufferInstrument";
import {TrackState} from "@songwalker";
import {generateRandomBuffer} from "@songwalker/instruments/test/testHelper";
import {getDefaultSongFunctions, getDefaultTrackState} from "@songwalker/helper/songHelper";


describe('AudioBuffer', () => {
    it('AudioBuffer plays C#4^10d1/2', async () => {
        const context = new AudioContext();
        const src = generateRandomBuffer(context)
        const track: TrackState = {
            ...getDefaultTrackState(context.destination),
            beatsPerMinute: 32
        }
        track.instrument = await AudioBufferInstrument(track, {
            src,
            loop: true,
            mixer: 1,
            pan: -.2
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
