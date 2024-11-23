import OscillatorInstrument from "@songwalker/instruments/OscillatorInstrument";

describe('Oscillator', () => {
    it('Oscillator plays C#4v0.1d1/2', async () => {
        const instrument = OscillatorInstrument({})
        const context = new AudioContext();
        const trackState = {
            beatsPerMinute: 180,
            bufferDuration: 0,
            currentTime: 0,
            destination: context.destination,
            noteDuration: 0,
            noteVelocity: 0,
            velocityDivisor: 0,
            instrument
        }

        function wait(duration: number) {
            trackState.currentTime += (duration) * (60 / trackState.beatsPerMinute);
        }

        instrument(trackState, 'C#4v0.1d1/8')
        wait(1 / 8)
        instrument(trackState, 'D#4v0.1d1/8')
        wait(1 / 8)
    })
})
