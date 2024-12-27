// noinspection DuplicatedCode

import {TrackState} from "@songwalker";
import {getDefaultSongFunctions, getDefaultTrackState} from "@songwalker/helper/songHelper";
import ReverbEffect from "@songwalker/instruments/effects/convolver/ReverbEffect";
import {OscillatorInstrument} from "@songwalker/instruments";

describe('Oscillator', () => {
    it('Oscillator with Reverb', async () => {

        const context = new AudioContext();
        const track: TrackState = {
            ...getDefaultTrackState(context.destination),
        }
        OscillatorInstrument(track, {mixer: 1.1});
        await ReverbEffect(track, {reverse: true});

        const {wait, parseAndPlayCommand: play} = getDefaultSongFunctions();


        for (let o = 2; o <= 6; o++) {
            for (let i = 0; i < 6; i++) {
                const note = String.fromCharCode(65 + i)
                play(track, `${note}${o}^0.1@1/8`)
                wait(track, 1 / 8)
            }
        }
    })
})
