import AudioBufferInstrument from "@songwalker/instruments/AudioBufferInstrument";
import {parseCommandValues, TrackState} from "@songwalker";

function generateRandomBuffer(context: AudioContext) {
    const src = context.createBuffer(1, 8192, 44100);
    const audioBufferArray = src.getChannelData(0);
    for (let i = 0; i < 8192; i++) {
        audioBufferArray[i] = Math.sin((i % 168) / 168.0 * Math.PI * 2);
    }
    return src;
}

describe('AudioBuffer', () => {
    it('AudioBuffer plays C#4^0.1d1/2', async () => {
        const context = new AudioContext();
        const src = generateRandomBuffer(context)
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
        trackState.instrument = await AudioBufferInstrument.bind(trackState)({
            src,
            loop: true,
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
