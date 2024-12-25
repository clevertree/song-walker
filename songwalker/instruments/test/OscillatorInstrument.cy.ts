import OscillatorInstrument from "@songwalker/instruments/OscillatorInstrument";
import {TrackState} from "@songwalker";
import {getDefaultTrackState} from "@songwalker/helper/songHelper";
import {testCommands} from "@songwalker/instruments/test/testHelper";

describe('Oscillator', () => {
    it('Oscillator plays notes', async () => {

        const context = new AudioContext();
        const track: TrackState = {
            ...getDefaultTrackState(context.destination),
        }
        track.instrument = OscillatorInstrument.bind(track)({
            mixer: 1.1
        })
        const {wait, parseAndPlayCommand: play} = testCommands(track);

        play("release@0")
        for (let i = 0; i < 4; i++) {
            play('C#4^0.1@1/8')
            wait(1 / 8)
            play('D#4^0.1@1/8')
            wait(1 / 8)
        }
        play("release@/2")
        play("attack@1")
        for (let i = 0; i < 2; i++) {
            play('C#4^0.1@1')
            wait(1)
            play('D#4^0.1@1')
            wait(1)
        }
    })

})
