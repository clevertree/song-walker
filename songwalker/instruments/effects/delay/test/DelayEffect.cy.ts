// noinspection DuplicatedCode

import {TrackState} from "@songwalker";
import {getDefaultSongWalkerState, getDefaultTrackState} from "@songwalker/helper/songHelper";
import {OscillatorInstrument} from "@songwalker/instruments";
import DelayEffect from "@songwalker/instruments/effects/delay/DelayEffect";

describe('Oscillator', () => {
    it('Oscillator with Delay', async () => {

        const context = new AudioContext();
        await context.suspend()
        const track: TrackState = getDefaultTrackState(context.destination)
        track.beatsPerMinute = 30

        OscillatorInstrument(track, {
            mixer: .8,
            pan: 0.5
        });
        track.effects = [await DelayEffect(track, {
            duration: 1,
            feedback: .5
        })];

        const {waitAsync, parseAndExecute: play} = getDefaultSongWalkerState();


        for (let o = 2; o <= 6; o++) {
            for (let i = 0; i < 6; i++) {
                const note = String.fromCharCode(65 + i)
                play(track, `${note}${o}@1/9`)
                await waitAsync(track, 1 / 8)
            }
        }
        await waitAsync(track, 1);
        play(track, `D4@/2`)
        await waitAsync(track, 1);
        play(track, `C4@/2`)
        await waitAsync(track, 1);

    })
})
