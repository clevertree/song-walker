import EnvelopeEffect, {EnvelopeEffectConfig} from "../effects/Envelope";
import {InstrumentInstance, TrackState, parseNote} from "@songwalker";

const DEFAULT_OSCILLATOR_TYPE = 'square';

export interface OscillatorInstrumentConfig {
    type?: string,
    envelope?: EnvelopeEffectConfig
    detune?: number,
    pulseWidth?: number,
    mixer?: number,
    attack?: number,
    // hold?: number,
    // decay?: number,
    // sustain?: number,
    release?: number
}

export default function OscillatorInstrument(config: OscillatorInstrumentConfig): InstrumentInstance {
    // console.log('OscillatorInstrument', config, config.type);
    // let activeOscillators = [];
    // let createEnvelope = EnvelopeEffect(config.envelope)

    return function (trackState: TrackState, noteCommand: string) {
        const noteInfo = parseNote(noteCommand);
        if (!noteInfo)
            throw new Error("Unrecognized note: " + noteCommand);
        const {frequency, params} = noteInfo;
        let {destination, currentTime, noteDuration, noteVelocity} = trackState;
        if (params) {
            if (params.duration)
                noteDuration = params.duration
            if (params.velocity)
                noteVelocity = params.velocity
        }
        // const gainNode = audioContext.createGain(); //to get smooth rise/fall
        let amplitude = config.mixer || 1;
        if (noteVelocity)
            amplitude *= noteVelocity;
        let gainNode = destination.context.createGain();
        gainNode.connect(destination);

        // Attack is the time taken for initial run-up of level from nil to peak, beginning when the key is pressed.
        if (config.attack) {
            gainNode.gain.value = 0;
            gainNode.gain.linearRampToValueAtTime(amplitude, currentTime + (config.attack / 1000));
        } else {
            gainNode.gain.value = amplitude;
        }
        // Envelope
        // const velocityGainNode = createEnvelope(trackState, noteCommand);

        const oscillator = createOscillator(gainNode, config.type || DEFAULT_OSCILLATOR_TYPE);
        oscillator.frequency.value = frequency;
        if (typeof config.detune !== "undefined")
            oscillator.detune.setValueAtTime(config.detune, currentTime); // value in cents
        oscillator.start(currentTime);
        if (noteDuration) {
            const endTime = currentTime + noteDuration;
            oscillator.stop(endTime);
        }
        return oscillator
    }

    function createOscillator(destination: AudioNode, type: string) {
        let source;
        switch (type) {
            case 'sine':
            case 'square':
            case 'sawtooth':
            case 'triangle':
                source = destination.context.createOscillator();
                source.type = type;
                // Connect Source
                source.connect(destination);
                return source;

            default:
                throw new Error("Unknown oscillator type: " + type);
        }

    }

}
