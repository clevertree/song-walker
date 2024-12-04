// noinspection DuplicatedCode

import WebAudioFontInstrument from "@songwalker-presets/WebAudioFont/WebAudioFontInstrument";
import {parseCommandValues, TrackState} from "@songwalker";
import {defaultSongFunctions} from "@songwalker/helper/songHelper";
import instrumentKeys from './instrumentKeys.json'

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
        trackState.instrument = await WebAudioFontInstrument.bind(trackState)({
            instrumentKey: instrumentKeys[Math.round(Math.random() * instrumentKeys.length)]
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
