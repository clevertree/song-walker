// noinspection DuplicatedCode

import {TrackState} from "@songwalker";
import {getDefaultSongFunctions, getDefaultTrackState} from "@songwalker/helper/songHelper";
import {OscillatorInstrument} from "@songwalker/instruments";
import ReverbEffect from "@songwalker/instruments/effects/reverb/ReverbEffect";

describe('Oscillator', () => {
    it('Oscillator with Reverb', async () => {

        const context = new AudioContext();
        await context.suspend()
        const track: TrackState = getDefaultTrackState(context.destination)
        // track.bufferDuration = 0.2

        OscillatorInstrument(track, {
            mixer: .1,
            pan: 0.2
        });
        track.effects = [await ReverbEffect(track, {
            reverse: false,
            duration: 10,
            decay: 10
        })];

        const {waitAsync, parseAndExecute: play} = getDefaultSongFunctions();


        for (let o = 2; o <= 6; o++) {
            for (let i = 0; i < 6; i++) {
                const note = String.fromCharCode(65 + i)
                play(track, `${note}${o}^32@1/9`)
                await waitAsync(track, 1 / 8)
            }
        }
    })
})
