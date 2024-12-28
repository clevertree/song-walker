import {InstrumentInstance, TrackState} from "@songwalker";
import {CommandParams} from "@songwalker/types";

export interface ReverbEffectConfig {
    seconds?: number,
    decay?: number,
    reverse?: boolean
}

export default async function ReverbEffect(track: TrackState, config: ReverbEffectConfig): Promise<InstrumentInstance> {
    const {
        destination: {
            context: audioContext
        }
    } = track;
    const startTime = audioContext.currentTime;
    const {
        seconds = 3,
        decay = 2,
        reverse = false
    } = config;
    const input = audioContext.createConvolver();
    const output = input;

    buildImpulse();

    const syncTime = audioContext.currentTime - track.currentTime;
    if (syncTime > 0) {
        track.currentTime = audioContext.currentTime // Move track time forward to compensate for loading time
        console.log("ReverbEffect loading syncs currentTime to ", track.currentTime)
    }

    // this.effects.push(analyzerEffect)
    function connectReverbEffect(track: TrackState, command: string, params: CommandParams) {
        const {destination} = {...track, ...params};
        const effectDestination = audioContext.createGain();
        output.connect(destination);
        // TODO: mixer value
        effectDestination.connect(input);
        effectDestination.connect(track.destination);
        params.destination = effectDestination;
    }

    // Automatically append effect to track state
    track.effects.push(connectReverbEffect)
    return connectReverbEffect;

    function buildImpulse() {
        // based on https://github.com/clevertree/simple-reverb/
        let rate = audioContext.sampleRate
            , length = rate * seconds
            // , decay = this.decay
            , impulse = audioContext.createBuffer(2, length, rate)
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
