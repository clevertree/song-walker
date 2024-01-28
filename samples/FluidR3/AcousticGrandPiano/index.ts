import {AudioBufferDynamicInstrumentConfig} from "@songwalker/instruments/AudioBuffer/Dynamic";
import {PolyphonyInstrumentConfig, VoiceConfiguration} from "@songwalker/instruments/Polyphony";
import {EnvelopeEffectConfig} from "@songwalker/instruments/effects/Envelope";
import {InstrumentPreset, PresetBank} from "@songwalker/types";

const relativeURL = `${process.env.NEXT_PUBLIC_SAMPLE_URL}FluidR3/AcousticGrandPiano/`;
const title = "Acoustic Grand Piano"

const envelope: EnvelopeEffectConfig = {release: 100}
const AcousticGrandPiano: PresetBank = {
    title,
    getPreset(presetPath: string): InstrumentPreset<PolyphonyInstrumentConfig<AudioBufferDynamicInstrumentConfig>> {
        return {
            title,
            instrument: 'Polyphony',
            config: {
                voices: [
                    getVoice("0", 31, "C0", "D2", 170893, 219499),
                    getVoice("1", 27, "D#2", "F#2", 160113, 195247),
                    getVoice("2", 23, "G2", "A#2", 129454, 165045),
                    getVoice("3", 19, "B2", "D3", 158947, 193111),
                    getVoice("4", 15, "D#3", "F#3", 120490, 155602),
                    getVoice("5", 11, "G3", "A#3", 109152, 141103),
                    getVoice("6", 7, "B3", "D4", 77368, 109543),
                    getVoice("7", 3, "D#4", "F#4", 55019, 84480),
                    getVoice("8", -1, "G4", "A#4", 52686, 87542),
                    getVoice("9", -5, "B4", "D5", 73030, 103885),
                    getVoice("10", -9, "D#5", "F#5", 62381, 88426),
                    getVoice("11", -13, "G5", "A#5", 51471, 71088),
                    getVoice("12", -17, "B5", "D6", 44165, 67047),
                    getVoice("13", -21, "D#6", "F#6", 47507, 75718),
                    getVoice("14", -27, "G6", "C7", 43879, 46535),
                    getVoice("15", -33, "C#7", "F#7", 40281, 60328),
                    getVoice("16", -37, "G7", "A#7", 40230, 41513),
                    getVoice("17", -42, "B7", "D#8", 17820, 18113),
                    getVoice("18", -47, "E8", "G#8", 13695, 14104),
                    getVoice("19", -51, "A8", "C9", 12048, 12733),
                ]
            }
        };

        function getVoice(alias: string,
                          frequencyRoot: number,
                          keyRangeLow: string,
                          keyRangeHigh: string,
                          loopStart: number,
                          loopEnd: number): VoiceConfiguration<AudioBufferDynamicInstrumentConfig> {
            return {
                alias,
                keyRangeLow,
                keyRangeHigh,
                preset: {
                    instrument: "AudioBufferDynamic",
                    config: {
                        frequencyRoot,
                        src: `${relativeURL}s/${alias}.wav`,
                        loopStart,
                        loopEnd,
                        envelope
                    }
                }
            }
        }
    },
    * listPresets(presetPath: string): Generator<InstrumentPreset> {
        yield AcousticGrandPiano.getPreset(presetPath);
    }

}

export default AcousticGrandPiano;
