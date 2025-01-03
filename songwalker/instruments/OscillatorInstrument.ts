import {TrackState} from "@songwalker";
import {InstrumentLoader, ParsedNote, SongWalkerState} from "@songwalker/types";
import {configEnvelope, EnvelopeConfig, updateEnvelopeConfig} from "./common/envelope";
import {configFilterByKeyRange, KeyRangeConfig} from "./common/filter";

const DEFAULT_OSCILLATOR_TYPE = 'square';

export interface OscillatorInstrumentConfig extends EnvelopeConfig, KeyRangeConfig {
    type?: 'sine' | 'square' | 'sawtooth' | 'triangle',
    pan?: number,
    detune?: number,
    pulseWidth?: number,
}

// type ConfigKey = keyof OscillatorInstrumentConfig;

const OscillatorInstrument: InstrumentLoader<OscillatorInstrumentConfig> = (songState: SongWalkerState, config) => {
    // console.log('OscillatorInstrument', config, config.type);
    const {
        context: audioContext,
        parseNote
    } = songState;
    let createOscillator = configOscillator();
    let createGain = configEnvelope(audioContext, config);
    let filterNote = configFilterByKeyRange(config)

    return function (track: TrackState, command: string) {
        switch (command) {
            case 'play':
            case 'stop':
                throw 'todo';
            case 'attack':
            case 'release':
                // TODO: move to envelope config file?
                return updateEnvelopeConfig(config, track, command)
            // case 'keyRangeHigh':
            // case 'keyRangeLow':
            //     return updateKeyRangeConfig(config, configKey as keyof KeyRangeConfig, commandState)
            case 'detune':
                return updateConfig(track, command)
        }
        const noteInfo = parseNote(command);
        if (!noteInfo)
            throw new Error("Unrecognized note: " + command);
        if (filterNote(noteInfo))
            return track
        return playOscillator(noteInfo, track)
    };

    function playOscillator(noteInfo: ParsedNote, track: TrackState) {
        let {
            currentTime,
            duration = 0,
            beatsPerMinute,
            pan = 0
        } = {...config, ...track};

        // Envelope
        const gainNode = createGain(track);
        let destination = gainNode;

        // Panning
        if (pan) {
            const panNode = audioContext.createStereoPanner();
            panNode.pan.value = pan;
            panNode.connect(gainNode);
            destination = panNode;
        }

        // Oscillator
        const oscillator = createOscillator(noteInfo, destination);
        oscillator.start(currentTime);
        const {release = 0} = config;
        let endTime = currentTime + (duration * (60 / beatsPerMinute));
        if (release) {
            endTime += release * (60 / beatsPerMinute)
        }
        oscillator.stop(endTime);
        // TODO: add active notes to track state?
        return track
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
                    source = audioContext.createOscillator();
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

    function updateConfig(track: TrackState, command: string) {
        switch (command) {
            case "detune":
                config.detune = track.velocity
                return track;
        }
        throw new Error("Unknown config key: " + command);
    }

}
export default OscillatorInstrument;
