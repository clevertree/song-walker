import {PolyphonyInstrumentConfig} from "@instruments/Polyphony";
import {AudioBufferInstrumentConfig} from "@instruments/AudioBuffer";
import {ALIASES, getPercussionInfo} from "@songwalker/constants/percussion";
import {InstrumentPreset, PresetBank} from "@songwalker/types";

const relativeURL = `${process.env.NEXT_PUBLIC_SAMPLE_URL}FluidR3/DrumKitRoom1/`;
const title = "DrumKit: Room 1"

const DrumKitRoom1: PresetBank = {
    title,
    getPreset(presetPath: string): InstrumentPreset<PolyphonyInstrumentConfig<AudioBufferInstrumentConfig>> {
        return {
            title,
            instrument: 'Polyphony',
            config: {
                voices: Object.values(ALIASES).map(alias => {
                    const {keyRange} = getPercussionInfo(alias);
                    return {
                        alias,
                        keyRangeLow: keyRange,
                        keyRangeHigh: keyRange,
                        preset: {
                            instrument: "AudioBuffer",
                            config: {
                                src: `${relativeURL}s/${alias}.wav`
                            }
                        }
                    }
                })
            }
        }
    },

    * listPresets(presetPath: string): Generator<InstrumentPreset> {
        return DrumKitRoom1.getPreset(presetPath);
    }

}

export default DrumKitRoom1;