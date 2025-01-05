// noinspection DuplicatedCode

import {OscillatorInstrument} from "@songwalker/instruments";
import DelayEffect from "@songwalker/instruments/effects/delay/DelayEffect";
import {getSongRendererState} from "@songwalker/helper/songHelper";

describe('Oscillator', () => {
    it('Oscillator with Delay', async () => {
        const context = new OfflineAudioContext({
            numberOfChannels: 2,
            length: 44100 * 8,
            sampleRate: 44100,
        });
        const songState = getSongRendererState(context);
        const {rootTrackState: track} = songState;
        track.beatsPerMinute = 30

        OscillatorInstrument(songState, {
            mixer: .8,
            pan: 0.5
        });
        track.effects = [await DelayEffect(songState, {
            duration: 1,
            feedback: .5
        })];

        const {wait, execute} = songState;


        for (let o = 2; o <= 6; o++) {
            for (let i = 0; i < 6; i++) {
                const note = String.fromCharCode(65 + i)
                execute(track, `${note}${o}`, {duration: 1 / 9})
                await wait(track, 1 / 8)
            }
        }
        await wait(track, 1);
        execute(track, `D4`, {duration: 1 / 2})
        await wait(track, 1);
        execute(track, `C4`, {duration: 1 / 2})
        await wait(track, 1);

    })
})
