// noinspection DuplicatedCode

import {getSongRendererState} from "@songwalker/helper/songHelper";
import {OscillatorInstrument} from "@songwalker/instruments";
import ReverbEffect from "@songwalker/instruments/effects/reverb/ReverbEffect";

describe('Oscillator', () => {
    it('Oscillator with Reverb', async () => {
        const context = new OfflineAudioContext({
            numberOfChannels: 2,
            length: 44100 * 8,
            sampleRate: 44100,
        });
        const songState = getSongRendererState(context);
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

        const {wait, execute} = songState;


        for (let o = 2; o <= 6; o++) {
            for (let i = 0; i < 6; i++) {
                const note = String.fromCharCode(65 + i)
                execute(track, `${note}${o}`, {duration: 1 / 9})
                await wait(track, 1 / 8)
            }
        }
    })
})
