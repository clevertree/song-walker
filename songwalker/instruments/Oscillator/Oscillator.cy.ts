import OscillatorInstrument from "@songwalker/instruments/Oscillator";

describe('Oscillator', () => {
    it('Oscillator plays C#4v0.1d1/2', async () => {
        const instrument = OscillatorInstrument({})
        const context = new AudioContext();
        const trackState = {
            beatsPerMinute: 0,
            bufferDuration: 0,
            currentTime: 0,
            destination: context.destination,
            noteDuration: 0,
            noteVelocity: 0,
            velocityDivisor: 0,
            instrument
        }

        instrument(trackState, 'C#4v0.1d1/8')
    })
})
