import EnvelopeEffect, {EnvelopeEffectConfig} from "../effects/Envelope";
import {PlayNoteEvent} from "@songwalker/walker";
import {InstrumentInstance} from "@songwalker/types";

const DEFAULT_OSCILLATOR_TYPE = 'square';

export interface OscillatorInstrumentConfig {
    type?: string,
    envelope?: EnvelopeEffectConfig
    detune?: number,
    pulseWidth?: number,
}

export default function OscillatorInstrument(config: OscillatorInstrumentConfig): InstrumentInstance {
    // console.log('OscillatorInstrument', config, config.type);
    // let activeOscillators = [];
    let createEnvelope = EnvelopeEffect(config.envelope)

    // TODO?
    // return function(eventName, ...args) {
    return function (noteEvent: PlayNoteEvent) {
        const {value, startTime, duration} = noteEvent;
        const frequency = noteEvent.parseFrequency()
        // const gainNode = audioContext.createGain(); //to get smooth rise/fall

        // Envelope
        const velocityGainNode = createEnvelope(noteEvent);

        const oscillator = createOscillator(config.type || DEFAULT_OSCILLATOR_TYPE, velocityGainNode);
        if (frequency === null)
            throw new Error("Invalid note string: " + value)
        oscillator.frequency.value = frequency;
        if (typeof config.detune !== "undefined")
            oscillator.detune.setValueAtTime(config.detune, startTime); // value in cents
        oscillator.start(startTime);
        if (duration) {
            const endTime = startTime + duration;
            oscillator.stop(endTime);
        }
        return oscillator
    }

    function createOscillator(type: string, destination: AudioNode) {
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