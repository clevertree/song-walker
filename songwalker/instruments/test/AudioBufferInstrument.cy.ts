import AudioBufferInstrument from "@songwalker/instruments/AudioBufferInstrument";
import {TrackState} from "@songwalker";
import {generateRandomBuffer, testCommands} from "@songwalker/instruments/test/testHelper";
import {getDefaultTrackState} from "@songwalker/helper/songHelper";


describe('AudioBuffer', () => {
    it('AudioBuffer plays C#4^0.1d1/2', async () => {
        const context = new AudioContext();
        const src = generateRandomBuffer(context)
        const trackState: TrackState = {
            ...getDefaultTrackState(context.destination),
            destination: context.destination,
        }
        trackState.instrument = await AudioBufferInstrument.bind(trackState)({
            src,
            loop: true,
            mixer: 0.1
        })
        const {wait, playCommand} = testCommands(trackState);

        for (let i = 0; i < 8; i++) {
            playCommand('C#4^0.1@1/8')
            wait(1 / 8)
            playCommand('D#4^0.1@1/8')
            wait(1 / 8)
        }
    })
})
