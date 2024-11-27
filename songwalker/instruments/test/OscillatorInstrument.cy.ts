import OscillatorInstrument from "@songwalker/instruments/OscillatorInstrument";
import {parseCommandValues, TrackState} from "@songwalker";
import AudioBufferInstrument from "@songwalker/instruments/AudioBufferInstrument";

describe('Oscillator', () => {
    it('Oscillator plays C#4^0.1d1/2', async () => {

        const context = new AudioContext();
        const trackState: TrackState = {
            beatsPerMinute: 180,
            bufferDuration: 0,
            currentTime: 0,
            destination: context.destination,
            noteDuration: 0,
            noteVelocity: 0,
            velocityDivisor: 1,
            instrument: () => undefined
        }
        trackState.instrument = await OscillatorInstrument.bind(trackState)({
            mixer: 0.1
        })

        function wait(duration: number) {
            trackState.currentTime += (duration) * (60 / trackState.beatsPerMinute);
        }

        function playCommand(commandString: string) {
            const commandInfo = parseCommandValues(commandString);
            trackState.instrument.bind(trackState)({...trackState, ...commandInfo.params, command: commandInfo.command})
        }

        for (let i = 0; i < 8; i++) {
            playCommand('C#4^0.1@1/8')
            wait(1 / 8)
            playCommand('D#4^0.1@1/8')
            wait(1 / 8)
        }
    })
})
