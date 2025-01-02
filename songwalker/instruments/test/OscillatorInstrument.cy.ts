import OscillatorInstrument from "@songwalker/instruments/OscillatorInstrument";
import {getDefaultSongWalkerState} from "@songwalker/helper/songHelper";

describe('Oscillator', () => {
    it('Oscillator plays notes', async () => {
        const context = new AudioContext();
        const songState = getDefaultSongWalkerState(context);
        const {rootTrackState: track} = songState;
        track.instrument = await OscillatorInstrument(songState, {
            mixer: .8,
            pan: 1
        })
        const {wait, parseAndExecute: play} = songState;

        // play(track, "release@0")
        for (let i = 0; i < 4; i++) {
            play(track, 'C#4@1/8')
            wait(track, 1 / 8)
            play(track, 'D#4@1/8')
            wait(track, 1 / 8)
        }
        // play(track, "release@/2")
        // play(track, "attack@1")
        for (let i = 0; i < 2; i++) {
            play(track, 'C#4@1')
            wait(track, 1)
            play(track, 'D#4@1')
            wait(track, 1)
        }
    })

})
