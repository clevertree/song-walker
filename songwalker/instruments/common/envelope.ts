import {TrackState} from "@songwalker";
import {CommandParams} from "@songwalker/types";

export interface EnvelopeConfig {
    mixer?: number,
    attack?: number,
    // hold?: number,
    // decay?: number,
    // sustain?: number,
    release?: number
}

export function updateEnvelopeConfig(config: EnvelopeConfig, paramName: keyof EnvelopeConfig, track: TrackState, params: CommandParams) {
    const {duration = 0} = params;
    switch (paramName) {
        case 'attack':
            config.attack = duration * (60 / track.beatsPerMinute)
            return;
        case 'release':
            config.release = duration * (60 / track.beatsPerMinute)
            return;
    }
    throw new Error("Unknown config key: " + paramName);
}

export function configEnvelope(context: BaseAudioContext, config: EnvelopeConfig): (trackState: TrackState) => AudioNode {
    // Attack is the time taken for initial run-up of level from nil to peak, beginning when the key is pressed.
    // if (config.mixer || config.attack) {
    return (trackState: TrackState) => {
        let {attack = 0, mixer = 1, release = 0} = config;
        const {currentTime, velocity, velocityDivisor, destination} = trackState
        let gainNode = context.createGain();
        gainNode.connect(destination);
        const amplitude = mixer * (velocity / velocityDivisor);
        if (attack) {
            gainNode.gain.value = 0;
            gainNode.gain.linearRampToValueAtTime(amplitude, currentTime + (attack));
            console.log('attack', {currentTime, attack})
        } else {
            gainNode.gain.value = amplitude;
        }
        return gainNode;
    }
    // }
    // return (trackState: TrackState) => trackState.destination;
}
