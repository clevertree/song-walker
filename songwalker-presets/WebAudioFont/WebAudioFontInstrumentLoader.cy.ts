// noinspection DuplicatedCode

import {parseCommandValues, TrackState} from "@songwalker";
import instrumentKeys from './instrumentKeys.json'
import WebAudioFontInstrumentLoader from "@songwalker-presets/WebAudioFont/WebAudioFontInstrumentLoader";

describe('WebAudioFontInstrument', () => {

    it('loads and plays', async () => {
        const context = new AudioContext();
        const trackState: TrackState = {
            beatsPerMinute: 240,
            bufferDuration: 0,
            currentTime: 0,
            destination: context.destination,
            noteDuration: 0,
            noteVelocity: 0,
            velocityDivisor: 1,
            instrument: () => undefined
        }
        trackState.instrument = await WebAudioFontInstrumentLoader.bind(trackState)({
            instrumentPath: 'i/' + instrumentKeys[Math.round(Math.random() * instrumentKeys.length)] + '.json'
        })

        function wait(duration: number) {
            trackState.currentTime += (duration) * (60 / trackState.beatsPerMinute);
        }

        function playCommand(commandString: string) {
            const commandInfo = parseCommandValues(commandString);
            trackState.instrument.bind(trackState)({...trackState, ...commandInfo.params, command: commandInfo.command})
        }

        for (let i = 0; i < 4; i++) {
            playCommand('C3^0.1@1/2')
            wait(1 / 2)
            playCommand('D#3^0.1@1/2')
            wait(1 / 2)
        }
    })
})
