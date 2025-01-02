import {InstrumentInstance, TrackState} from "@songwalker";
import {CommandWithParams} from "@songwalker/types";

export interface ReverbEffectConfig {
    duration?: number,
    decay?: number,
    reverse?: boolean,
    wet?: number
    dry?: number
}

export default async function ReverbEffect(track: TrackState, config: ReverbEffectConfig): Promise<InstrumentInstance> {
    const {
        destination: {
            context: audioContext
        }
    } = track;
    const {
        duration = 1,
        decay = 2,
        reverse = false
    } = config;
    const input = new ConvolverNode(audioContext);
    const output = input;

    buildImpulse();

    const syncTime = audioContext.currentTime - track.currentTime;
    if (syncTime > 0) {
        track.currentTime = audioContext.currentTime // Move track time forward to compensate for loading time
        console.error(`ReverbEffect continued loading past buffer (${syncTime}). Syncing currentTime to `, track.currentTime)
    }

    // this.effects.push(analyzerEffect)
    function connectReverbEffect(track: TrackState, commandWithParams: CommandWithParams) {
        const {destination, wet = 0.5, dry = 1} = {...config, ...track, ...commandWithParams};
        const effectDestination = audioContext.createGain();
        output.connect(destination);
        // TODO: mixer value

        // Mixer
        const wetGain = new GainNode(audioContext, {gain: wet});
        const dryGain = new GainNode(audioContext, {gain: dry});
        wetGain.connect(input)
        dryGain.connect(destination)

        // Connect to destination
        effectDestination.connect(wetGain);
        effectDestination.connect(dryGain);
        commandWithParams.destination = effectDestination;
    }

    // Don't automatically append effect to track state
    // track.effects.push(connectReverbEffect)
    return connectReverbEffect;

    function buildImpulse() {
        const durationSeconds = duration * (60 / track.beatsPerMinute)
        // based on https://github.com/clevertree/simple-reverb/
        let rate = audioContext.sampleRate
            , length = rate * durationSeconds
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
