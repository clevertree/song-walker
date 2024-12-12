import {InstrumentInstance, TrackState} from "@songwalker";
import {CommandState} from "@songwalker/types";

export interface ReverbEffectConfig {
    seconds?: number,
    decay?: number,
    reverse?: boolean
}

export default async function ReverbEffect(this: TrackState, config: ReverbEffectConfig): Promise<InstrumentInstance> {
    const {
        destination: {
            context
        }
    } = this;
    const {
        seconds = 3,
        decay = 2,
        reverse = 0
    } = config;
    const input = context.createConvolver();
    const output = input;

    buildImpulse();


    // this.effects.push(analyzerEffect)
    function connectReverbEffect(this: TrackState, commandState: CommandState) {
        const destination = context.createGain();
        output.connect(commandState.destination);
        // TODO: mixer value
        destination.connect(input);
        destination.connect(commandState.destination);
        commandState.destination = destination;
    }

    // Automatically append effect to track state
    this.effects.push(connectReverbEffect)
    return connectReverbEffect;

    function buildImpulse() {
        // based on https://github.com/clevertree/simple-reverb/
        var rate = context.sampleRate
            , length = rate * seconds
            // , decay = this.decay
            , impulse = context.createBuffer(2, length, rate)
            , impulseL = impulse.getChannelData(0)
            , impulseR = impulse.getChannelData(1)
            , n, i;

        for (i = 0; i < length; i++) {
            n = reverse ? length - i : i;
            impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
            impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
        }

        input.buffer = impulse;
    }
}

// Effect may encapsulate current instrument to modify commands in real-time
