import {InstrumentPreset, PresetBank} from "@songwalker/types";
import AcousticGrandPiano from "./AcousticGrandPiano";
import DrumKitRoom1 from "./DrumKitRoom1";


const presets: { [libraryName: string]: PresetBank } = {
    AcousticGrandPiano,
    DrumKitRoom1
}
const relativeURL: string = '/samples/FluidR3/'
const FluidR3Library: PresetBank = {
    title: "FluidR3",
    * listPresets(presetPath: string): Generator<InstrumentPreset> {
        const [prefix, ...parts] = presetPath.split('/');
        for (const presetName of Object.keys(presets))
            if (prefix === presetName)
                yield* presets[presetName].listPresets(parts.join('/'))
    },
    getPreset(presetPath: string): InstrumentPreset {
        const [prefix, ...parts] = presetPath.split('/');
        if (presets[prefix])
            return presets[prefix].getPreset(parts.join('/'));
        throw new Error("Invalid preset path: " + presetPath);
    }
}
export default FluidR3Library