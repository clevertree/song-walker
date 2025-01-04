// noinspection DuplicatedCode

import {getDefaultSongWalkerState} from "@songwalker/helper/songHelper";
import {OscillatorInstrument} from "@songwalker/instruments";
import ReverbEffect from "@songwalker/instruments/effects/reverb/ReverbEffect";

describe('Oscillator', () => {
    it('Oscillator with Reverb', async () => {

        const context = new AudioContext();
        await context.suspend()
        const songState = getDefaultSongWalkerState(context);
        const {rootTrackState: track} = songState;
        // track.bufferDuration = 0.2

        OscillatorInstrument(songState, {
            mixer: .8,
            pan: 0.2
        });
        track.effects = [await ReverbEffect(songState, {
            reverse: false,
            duration: 10,
            decay: 10
        })];

        const {waitAsync, execute} = songState;


        for (let o = 2; o <= 6; o++) {
            for (let i = 0; i < 6; i++) {
                const note = String.fromCharCode(65 + i)
                execute(track, `${note}${o}`, {duration: 1 / 9})
                await waitAsync(track, 1 / 8)
            }
        }
    })
})
