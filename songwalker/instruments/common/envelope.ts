import {TrackState} from "@songwalker";
import {CommandWithParams} from "@songwalker/types";

export interface EnvelopeConfig {
    mixer?: number,
    attack?: number,
    // hold?: number,
    // decay?: number,
    // sustain?: number,
    release?: number
}

export function updateEnvelopeConfig(config: EnvelopeConfig, track: TrackState, commandWithParams: CommandWithParams) {
    const {duration = 0} = commandWithParams;
    switch (commandWithParams.commandString) {
        case 'attack':
            config.attack = duration * (60 / track.beatsPerMinute)
            return;
        case 'release':
            config.release = duration * (60 / track.beatsPerMinute)
            return;
    }
    throw new Error("Unknown config key: " + commandWithParams.commandString);
}

export function configEnvelope(context: BaseAudioContext, config: EnvelopeConfig): (trackAndParams: TrackState & CommandWithParams) => AudioNode {
    // Attack is the time taken for initial run-up of level from nil to peak, beginning when the key is pressed.
    // if (config.mixer || config.attack) {
    return (trackAndParams) => {
        let {attack = 0, mixer = 1, release = 0} = config;
        const {startTime, velocity, velocityDivisor, destination} = trackAndParams
        let gainNode = context.createGain();
        gainNode.connect(destination);
        const amplitude = mixer * (velocity / velocityDivisor);
        if (attack) {
            gainNode.gain.value = 0;
            gainNode.gain.linearRampToValueAtTime(amplitude, startTime + (attack));
            console.log('attack', {startTime, attack})
        } else {
            gainNode.gain.value = amplitude;
        }
        return gainNode;
    }
    // }
    // return (trackState: TrackState) => trackState.destination;
}
