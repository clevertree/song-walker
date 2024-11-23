import {InstrumentInstance, TrackState, parseNote} from "@songwalker";
import {NoteHandler, ParsedCommandParams, ParsedNote} from "@songwalker/types";

const DEFAULT_OSCILLATOR_TYPE = 'square';

export interface OscillatorInstrumentConfig {
    type?: string,
    detune?: number,
    pulseWidth?: number,
    keyRangeLow?: string,
    keyRangeHigh?: string,
    mixer?: number,
    attack?: number,
    // hold?: number,
    // decay?: number,
    // sustain?: number,
    release?: number
}

type CB = (noteInfo: ParsedNote, trackState: TrackState, noteParams: ParsedCommandParams) => NoteHandler | undefined
type GainCB = (trackState: TrackState) => GainNode

export default function OscillatorInstrument(config: OscillatorInstrumentConfig): InstrumentInstance {
    // console.log('OscillatorInstrument', config, config.type);
    // let activeOscillators = [];
    // let createEnvelope = EnvelopeEffect(config.envelope)

    let createGain = configEnvelope((trackState) => {
        const {destination} = trackState;
        let gainNode = destination.context.createGain();
        gainNode.connect(destination);
        return gainNode;
    })

    function playOscillator(noteInfo: ParsedNote, trackState: TrackState, noteParams: ParsedCommandParams) {

        const {frequency} = noteInfo;
        let {
            currentTime,
            noteDuration,
            noteVelocity,
            beatsPerMinute
        } = {...trackState, ...noteParams};
        // const gainNode = audioContext.createGain(); //to get smooth rise/fall
        let gainNode = createGain(trackState);


        const oscillator = createOscillator(gainNode, config.type || DEFAULT_OSCILLATOR_TYPE);
        oscillator.frequency.value = frequency;
        if (typeof config.detune !== "undefined")
            oscillator.detune.setValueAtTime(config.detune, currentTime); // value in cents
        oscillator.start(currentTime);
        if (noteDuration) {
            const endTime = currentTime + (noteDuration * (60 / beatsPerMinute));
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

    let handleCommand = (
        configFilterByKeyRangeLow(
            configFilterByKeyRangeHigh(
                configDetune(
                    playOscillator
                )
            )
        )
    )


    return function parseCommand(noteCommand: string, trackState: TrackState, noteParams: ParsedCommandParams) {
        const noteInfo = parseNote(noteCommand);
        if (!noteInfo)
            throw new Error("Unrecognized note: " + noteCommand);
        return handleCommand(noteInfo, trackState, noteParams)
    }

    function configEnvelope(callback: GainCB): GainCB {
        // Attack is the time taken for initial run-up of level from nil to peak, beginning when the key is pressed.
        if (config.attack) {
            const {attack, mixer = 1} = config;
            return (trackState: TrackState) => {
                const {currentTime} = trackState
                const gainNode = callback(trackState);
                gainNode.gain.value = 0;
                gainNode.gain.linearRampToValueAtTime(mixer, currentTime + (attack / 1000));
                return gainNode;
            }
        }
        return callback;
    }

    function configDetune(callback: CB): CB {
        return callback;
    }


    function configFilterByKeyRangeLow(callback: CB): CB {
        if (typeof config.keyRangeLow !== 'undefined') {
            const keyRangeLowFrequency = parseNote(config.keyRangeLow).frequency;
            return (noteInfo: ParsedNote, ...args) => {
                if (keyRangeLowFrequency > noteInfo.frequency) {
                    return;
                }
                return callback(noteInfo, ...args)
            }
        }
        return callback;
    }

    function configFilterByKeyRangeHigh(callback: CB): CB {
        if (typeof config.keyRangeHigh !== 'undefined') {
            const keyRangeHighFrequency = parseNote(config.keyRangeHigh).frequency;
            return (noteInfo: ParsedNote, ...args) => {
                if (keyRangeHighFrequency < noteInfo.frequency) {
                    return;
                }
                return callback(noteInfo, ...args)
            }
        }
        return callback;
    }
}

