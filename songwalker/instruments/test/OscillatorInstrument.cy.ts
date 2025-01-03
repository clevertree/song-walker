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
        const {wait, execute: play} = songState;

        // play(track, "release@0")
        let duration = 1 / 8
        for (let i = 0; i < 4; i++) {
            play(track, 'C#4', {duration})
            wait(track, duration)
            play(track, 'D#4', {duration})
            wait(track, duration)
        }
        // play(track, "release@/2")
        // play(track, "attack@1")
        duration = 1;
        for (let i = 0; i < 2; i++) {
            play(track, 'C#4', {duration})
            wait(track, duration)
            play(track, 'D#4', {duration})
            wait(track, duration)
        }
    })

})
