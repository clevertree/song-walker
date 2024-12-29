import OscillatorInstrument from "@songwalker/instruments/OscillatorInstrument";
import {TrackState} from "@songwalker";
import {getDefaultSongFunctions, getDefaultTrackState} from "@songwalker/helper/songHelper";

describe('Oscillator', () => {
    it('Oscillator plays notes', async () => {

        const context = new AudioContext();
        const track: TrackState = {
            ...getDefaultTrackState(context.destination),
        }
        track.instrument = OscillatorInstrument(track, {
            mixer: 1.1
        })
        const {wait, parseAndPlayCommand: play} = getDefaultSongFunctions();

        // play(track, "release@0")
        for (let i = 0; i < 4; i++) {
            play(track, 'C#4^0.1@1/8')
            wait(track, 1 / 8)
            play(track, 'D#4^0.1@1/8')
            wait(track, 1 / 8)
        }
        // play(track, "release@/2")
        // play(track, "attack@1")
        for (let i = 0; i < 2; i++) {
            play(track, 'C#4^0.1@1')
            wait(track, 1)
            play(track, 'D#4^0.1@1')
            wait(track, 1)
        }
    })

})
