import {InstrumentPreset, PresetBank} from "@songwalker/types";
import FluidR3 from "@/samples/FluidR3";


const libraries: { [libraryName: string]: PresetBank } = {
    FluidR3
}

const PresetLibrary: PresetBank = {
    title: "DefaultLibrary",
    * listPresets(presetPath: string): Generator<InstrumentPreset> {
        const [libraryPrefix, ...parts] = presetPath.split('/');
        for (const libraryName of Object.keys(libraries))
            if (libraryPrefix === libraryName)
                yield* libraries[libraryName].listPresets(parts.join('/'))
    },
    getPreset(presetPath: string): InstrumentPreset {
        const [libraryName, ...parts] = presetPath.split('/');
        if (!libraryName)
            throw new Error("Invalid preset library");
        const library = libraries[libraryName];
        if (!library)
            throw new Error("Invalid preset library: " + libraryName);
        return library.getPreset(parts.join('/'));
    }
}
export default PresetLibrary