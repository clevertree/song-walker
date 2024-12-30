import {InstrumentInstance, parseNote, TrackState} from "@songwalker";
import {CommandWithParams, ParsedNote} from "@songwalker/types";
import {configEnvelope, EnvelopeConfig, updateEnvelopeConfig} from "./common/envelope";
import {configFilterByKeyRange, KeyRangeConfig} from "./common/filter";
import {defaultEmptyInstrument} from "@songwalker/helper/songHelper";

const DEFAULT_OSCILLATOR_TYPE = 'square';

export interface OscillatorInstrumentConfig extends EnvelopeConfig, KeyRangeConfig {
    type?: 'sine' | 'square' | 'sawtooth' | 'triangle',
    detune?: number,
    pulseWidth?: number,
}

// type ConfigKey = keyof OscillatorInstrumentConfig;

export default function OscillatorInstrument(track: TrackState, config: OscillatorInstrumentConfig): InstrumentInstance {
    // console.log('OscillatorInstrument', config, config.type);
    const {context} = track.destination;
    let createOscillator = configOscillator();
    let createGain = configEnvelope(context, config);
    let filterNote = configFilterByKeyRange(config)

    const instrumentInstance = function parseCommand(track: TrackState, commandWithParams: CommandWithParams) {
        switch (commandWithParams.commandString) {
            case 'play':
            case 'stop':
                throw 'todo';
            case 'attack':
            case 'release':
                // TODO: move to envelope config file?
                return updateEnvelopeConfig(config, track, commandWithParams)
            // case 'keyRangeHigh':
            // case 'keyRangeLow':
            //     return updateKeyRangeConfig(config, configKey as keyof KeyRangeConfig, commandState)
            case 'detune':
                return updateConfig(commandWithParams)
        }
        const noteInfo = parseNote(commandWithParams.commandString);
        if (!noteInfo)
            throw new Error("Unrecognized note: " + commandWithParams);
        if (filterNote(noteInfo))
            return
        return playOscillator(noteInfo, {...track, ...commandWithParams})
    }
    // Set instance to current instrument if no instrument is currently loaded
    if (track.instrument === defaultEmptyInstrument)
        track.instrument = instrumentInstance
    return instrumentInstance;

    function playOscillator(noteInfo: ParsedNote, trackAndParams: TrackState & CommandWithParams) {
        let {
            startTime,
            duration,
            beatsPerMinute,
            currentTime
        } = trackAndParams;

        // Envelope
        const gainNode = createGain(trackAndParams);
        // Oscillator
        const oscillator = createOscillator(noteInfo, gainNode);
        oscillator.start(startTime);
        const {release = 0} = config;
        let endTime = startTime + (duration * (60 / beatsPerMinute));
        if (release) {
            endTime += release * (60 / beatsPerMinute)
        }
        oscillator.stop(endTime);
        console.log({
            currentTime,
            startTime,
            endTime,
            duration,
            beatsPerMinute
        }, trackAndParams.destination.context.currentTime)
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
                    source = context.createOscillator();
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

    function updateConfig(commandWithParams: CommandWithParams) {
        switch (commandWithParams.commandString) {
            case "detune":
                config.detune = commandWithParams.velocity
        }
        throw new Error("Unknown config key: " + commandWithParams.commandString);
    }

}
