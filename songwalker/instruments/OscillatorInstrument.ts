import {InstrumentInstance, TrackState, parseNote} from "@songwalker";
import {ParsedCommandParams, ParsedNote} from "@songwalker/types";
import {configEnvelope, EnvelopeConfig} from "./common/envelope";
import {
    configFilterByCurrentTime,
    configFilterByKeyRange,
    KeyRangeConfig
} from "./common/filter";

const DEFAULT_OSCILLATOR_TYPE = 'square';

export interface OscillatorInstrumentConfig extends EnvelopeConfig, KeyRangeConfig {
    type?: string,
    detune?: number,
    pulseWidth?: number,
}

export default function OscillatorInstrument(config: OscillatorInstrumentConfig): InstrumentInstance {
    // console.log('OscillatorInstrument', config, config.type);

    let createOscillator = configOscillator();
    let createGain = configEnvelope(config);
    let filterNote = configFilterByKeyRange(config, configFilterByCurrentTime())

    return function parseCommand(noteCommand: string, trackState: TrackState, noteParams: ParsedCommandParams) {
        const noteInfo = parseNote(noteCommand);
        if (!noteInfo)
            throw new Error("Unrecognized note: " + noteCommand);
        const trackStateWithParams: TrackState = {...trackState, ...noteParams};
        if (filterNote(noteInfo, trackStateWithParams))
            return
        return playOscillator(noteInfo, trackStateWithParams)
    }

    function playOscillator(noteInfo: ParsedNote, trackState: TrackState) {
        let {
            currentTime,
            noteDuration,
            beatsPerMinute
        } = trackState;


        // Envelope
        const gainNode = createGain(trackState);
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

