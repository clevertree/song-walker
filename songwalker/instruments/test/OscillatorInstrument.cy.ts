import OscillatorInstrument from "@songwalker/instruments/OscillatorInstrument";
import {TrackState} from "@songwalker";
import {getDefaultTrackState} from "@songwalker/helper/songHelper";
import {testCommands} from "@songwalker/instruments/test/testHelper";

describe('Oscillator', () => {
    it('Oscillator plays notes', async () => {

        const context = new AudioContext();
        const trackState: TrackState = {
            ...getDefaultTrackState(context.destination),
            destination: context.destination,
        }
        trackState.instrument = OscillatorInstrument.bind(trackState)({
            mixer: 1.1
        })

        const {wait, playCommand} = testCommands(trackState);

        playCommand("release@1/8")
        for (let i = 0; i < 4; i++) {
            playCommand('C#4^0.1@1/8')
            wait(1 / 8)
            playCommand('D#4^0.1@1/8')
            wait(1 / 8)
        }
        playCommand("release@0")
        playCommand("attack@1")
        for (let i = 0; i < 2; i++) {
            playCommand('C#4^0.1@1')
            wait(1)
            playCommand('D#4^0.1@1')
            wait(1)
        }
    })

})
