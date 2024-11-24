import {TrackState} from "@songwalker";

export interface EnvelopeConfig {
    mixer?: number,
    attack?: number,
    // hold?: number,
    // decay?: number,
    // sustain?: number,
    release?: number
}

export function configEnvelope(config: EnvelopeConfig): (trackState: TrackState) => AudioNode {
    // Attack is the time taken for initial run-up of level from nil to peak, beginning when the key is pressed.
    if (config.mixer || config.attack) {
        let {attack = 0, mixer = 1} = config;
        return (trackState: TrackState) => {
            const {currentTime, noteVelocity, velocityDivisor = 1, destination} = trackState
            let gainNode = destination.context.createGain();
            gainNode.connect(destination);
            const amplitude = mixer * (noteVelocity / velocityDivisor);
            if (attack) {
                gainNode.gain.value = 0;
                gainNode.gain.linearRampToValueAtTime(amplitude, currentTime + (attack / 1000));
            } else {
                gainNode.gain.value = amplitude;
            }
            return gainNode;
        }
    }
    return (trackState: TrackState) => trackState.destination;
}
