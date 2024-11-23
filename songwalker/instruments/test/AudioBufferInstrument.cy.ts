import AudioBufferInstrument from "@songwalker/instruments/AudioBufferInstrument";

describe('AudioBuffer', () => {
    it('AudioBuffer plays C#4v0.1d1/2', async () => {
        const context = new AudioContext();
        const src = context.createBuffer(1, 8192, 44100);
        const audioBufferArray = src.getChannelData(0);
        for (let i = 0; i < 8192; i++) {
            audioBufferArray[i] = Math.sin((i % 168) / 168.0 * Math.PI * 2);
        }
        const instrument = await AudioBufferInstrument({
            src,
            loop: true,
            frequencyRoot: 216
        })
        const trackState = {
            beatsPerMinute: 6,
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

        instrument(trackState, 'C#3v0.1d1/8')
        wait(1 / 8)
        instrument(trackState, 'D#3v0.1d1/8')
        wait(1 / 8)
    })
})
