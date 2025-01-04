import AudioBufferInstrument from "@songwalker/instruments/AudioBufferInstrument";
import {generateRandomBuffer} from "@songwalker/instruments/test/testHelper";
import {getDefaultSongWalkerState} from "@songwalker/helper/songHelper";


describe('AudioBuffer', () => {
    it('AudioBuffer plays C#4d1/2', async () => {
        const context = new AudioContext();
        const src = generateRandomBuffer(context)
        const songState = getDefaultSongWalkerState(context);
        const {rootTrackState: track} = songState;
        track.beatsPerMinute = 32;
        track.instrument = await AudioBufferInstrument(songState, {
            src,
            loop: true,
            mixer: 1,
            pan: -.2
        })
        const {wait, execute} = songState;

        let duration = 1 / 8
        for (let i = 0; i < 4; i++) {
            execute(track, 'C#4', {duration})
            wait(track, duration)
            execute(track, 'D#4', {duration})
            wait(track, duration)
        }
    })
})
