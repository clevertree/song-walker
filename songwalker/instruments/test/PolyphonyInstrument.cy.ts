import PolyphonyInstrument from "@songwalker/instruments/PolyphonyInstrument";
import {parseCommandValues} from "@songwalker";
import OscillatorInstrument, {OscillatorInstrumentConfig} from "@songwalker/instruments/OscillatorInstrument";
import AudioBufferInstrument, {AudioBufferInstrumentConfig} from "@songwalker/instruments/AudioBufferInstrument";

function generateRandomBuffer(context: AudioContext) {
    const src = context.createBuffer(1, 8192, 44100);
    const audioBufferArray = src.getChannelData(0);
    for (let i = 0; i < 8192; i++) {
        audioBufferArray[i] = Math.sin((i % 168) / 168.0 * Math.PI * 2);
    }
    return src;
}

describe('Polyphony', () => {
    it('Polyphony plays C#4^0.1d1/2', async () => {
        const context = new AudioContext();
        const instrument = await PolyphonyInstrument({
            voices: [{
                alias: 'osc',
                instrument: OscillatorInstrument,
                config: {
                    mixer: 0.1,
                    type: 'sawtooth'
                } as OscillatorInstrumentConfig
            }, {
                alias: 'buffer',
                instrument: AudioBufferInstrument,
                config: {
                    mixer: 0.1,
                    src: generateRandomBuffer(context)
                } as AudioBufferInstrumentConfig
            }]
        })
        const trackState = {
            beatsPerMinute: 180,
            bufferDuration: 0,
            currentTime: 0,
            destination: context.destination,
            noteDuration: 0,
            noteVelocity: 0,
            velocityDivisor: 1,
            instrument
        }

        function wait(duration: number) {
            trackState.currentTime += (duration) * (60 / trackState.beatsPerMinute);
        }

        function playCommand(commandString: string) {
            const commandInfo = parseCommandValues(commandString);
            trackState.instrument(commandInfo.command, trackState, commandInfo.params)
        }

        for (let i = 0; i < 8; i++) {
            playCommand('C#4^0.1@1/8')
            wait(1 / 8)
            playCommand('D#4^0.1@1/8')
            wait(1 / 8)
        }
    })
})
