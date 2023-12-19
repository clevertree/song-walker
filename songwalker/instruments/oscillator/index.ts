import EnvelopeEffect, {EnvelopeEffectConfig} from "../effects/envelope";
import {InstrumentInstance, NoteEvent} from "@songwalker/walker";

const DEFAULT_OSCILLATOR_TYPE = 'square';
const DEFAULT_PULSE_WIDTH = 0;

interface OscillatorInstrumentConfig {
    type?: string,
    envelope?: EnvelopeEffectConfig
    detune?: number,
    pulseWidth?: number,
}

export default function OscillatorInstrument(config: OscillatorInstrumentConfig = {}): InstrumentInstance {
    console.log('OscillatorInstrument', config, config.type);
    // let activeOscillators = [];
    let createEnvelope = EnvelopeEffect(config.envelope)

    // TODO?
    // return function(eventName, ...args) {
    return function (noteEvent: NoteEvent) {
        const {frequency, startTime, duration, velocity} = noteEvent;
        // const gainNode = audioContext.createGain(); //to get smooth rise/fall
        const endTime = startTime + duration;

        // Envelope
        const envelopGainNode = createEnvelope(noteEvent);

        const oscillator = createOscillator(config.type || DEFAULT_OSCILLATOR_TYPE, envelopGainNode);
        oscillator.frequency.value = frequency;
        if (typeof config.detune !== "undefined")
            oscillator.detune.setValueAtTime(config.detune, startTime); // value in cents
        oscillator.start(startTime);
        oscillator.stop(endTime);
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

            case 'pulse':
                return createPulseWaveShaper(destination)

            // case null:
            // case 'custom':
            //     source=audioContext.createOscillator();
            //
            //     // Load Sample
            //     const service = new PeriodicWaveLoader();
            //     let periodicWave = service.tryCache(this.config.url);
            //     if(periodicWave) {
            //         this.setPeriodicWave(source, periodicWave);
            //     } else {
            //         service.loadPeriodicWaveFromURL(this.config.url)
            //             .then(periodicWave => {
            //                 console.warn("Note playback started without an audio buffer: " + this.config.url);
            //                 this.setPeriodicWave(source, periodicWave);
            //             });
            //     }
            //     // Connect Source
            //     source.connect(destination);
            //     return source;

            default:
                throw new Error("Unknown oscillator type: " + type);
        }

    }

    function createPulseWaveShaper(destination: AudioNode) {
        const audioContext = destination.context;
        // Use a normal oscillator as the basis of our new oscillator.
        const oscillatorNode = audioContext.createOscillator();
        oscillatorNode.type = "sawtooth";

        // const {pulseCurve, constantOneCurve} = getPulseCurve();
        // Use a normal oscillator as the basis of our new oscillator.

        // Shape the output into a pulse wave.
        const pulseShaper = audioContext.createWaveShaper();
        pulseShaper.curve = PULSE_CURVE;
        oscillatorNode.connect(pulseShaper);

        // Use a GainNode as our new "width" audio parameter.

        const widthGain = audioContext.createGain();
        widthGain.gain.value = (typeof config.pulseWidth !== "undefined"
            ? config.pulseWidth
            : DEFAULT_PULSE_WIDTH);

        // oscillatorNode.width = widthGain.gain; //Add parameter to oscillator node.
        widthGain.connect(pulseShaper);

        // Pass a constant value of 1 into the widthGain – so the "width" setting
        // is duplicated to its output.
        const constantOneShaper = audioContext.createWaveShaper();
        constantOneShaper.curve = CONSTANT_ONE_CURVE;
        oscillatorNode.connect(constantOneShaper);
        constantOneShaper.connect(widthGain);

        pulseShaper.connect(destination);

        return oscillatorNode;
    }

}


// Calculate the WaveShaper curves so that we can reuse them.
const PULSE_CURVE = new Float32Array(256);
for (let i = 0; i < 128; i++) {
    PULSE_CURVE[i] = -1;
    PULSE_CURVE[i + 128] = 1;
}
const CONSTANT_ONE_CURVE = new Float32Array(2);
CONSTANT_ONE_CURVE[0] = 1;
CONSTANT_ONE_CURVE[1] = 1;