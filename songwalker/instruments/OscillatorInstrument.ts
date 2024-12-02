import {InstrumentInstance, TrackState, parseNote} from "@songwalker";
import {CommandState, ParsedNote} from "@songwalker/types";
import {configEnvelope, EnvelopeConfig} from "./common/envelope";
import {
    configFilterByKeyRange,
    KeyRangeConfig
} from "./common/filter";

const DEFAULT_OSCILLATOR_TYPE = 'square';

export interface OscillatorInstrumentConfig extends EnvelopeConfig, KeyRangeConfig {
    type?: 'sine' | 'square' | 'sawtooth' | 'triangle',
    detune?: number,
    pulseWidth?: number,
}

export default function OscillatorInstrument(this: TrackState, config: OscillatorInstrumentConfig): InstrumentInstance {
    // console.log('OscillatorInstrument', config, config.type);

    let createOscillator = configOscillator();
    let createGain = configEnvelope(config);
    let filterNote = configFilterByKeyRange(config)

    return function parseCommand(this: TrackState, commandState: CommandState) {
        const {command} = commandState;
        const noteInfo = parseNote(command);
        if (!noteInfo)
            throw new Error("Unrecognized note: " + command);
        if (filterNote(noteInfo, commandState))
            return
        return playOscillator(noteInfo, commandState)
    }

    function playOscillator(noteInfo: ParsedNote, commandState: CommandState) {
        let {
            currentTime,
            noteDuration,
            beatsPerMinute
        } = commandState;


        // Envelope
        const gainNode = createGain(commandState);
        // Oscillator
        const oscillator = createOscillator(noteInfo, gainNode);

        oscillator.start(currentTime);
        if (noteDuration) {
            const endTime = currentTime + (noteDuration * (60 / beatsPerMinute));
            oscillator.stop(endTime);
        }
        // TODO: add active notes to track state?
        return oscillator
    }

    function configOscillator() {
        const {
            type = DEFAULT_OSCILLATOR_TYPE,
            detune = 0
        } = config;
        return (noteInfo: ParsedNote, destination: AudioNode) => {
            const {frequency} = noteInfo;
            let source;
            switch (type) {
                case 'sine':
                case 'square':
                case 'sawtooth':
                case 'triangle':
                    source = destination.context.createOscillator();
                    source.type = type;
                    source.detune.value = detune;
                    source.frequency.value = frequency;
                    // Connect Source
                    source.connect(destination);
                    return source;

                default:
                    throw new Error("Unknown oscillator type: " + type);
            }
        }
    }


}

