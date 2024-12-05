import {InstrumentPreset, PresetBank} from "@songwalker/types";
import WebAudioFontInstrumentLoader, {
    WebAudioFontInstrumentLoaderConfig
} from "@songwalker-presets/WebAudioFont/WebAudioFontInstrumentLoader";

export const WebAudioFontLibrary: PresetBank = {
    title: 'WebAudioFont',
    async* listPresets() {
        yield* listInstruments()
        yield* listDrumAndDrumSets();
    },
}

async function* listInstruments(): AsyncGenerator<InstrumentPreset<WebAudioFontInstrumentLoaderConfig>> {
    // TODO: fetch
    const {default: instrumentKeys} = await import("./instrumentKeys.json");
    const {default: instrumentNames} = await import("./instrumentNames.json");
    for (let i = 0; i < instrumentKeys.length; i++) {
        const instrumentKey = instrumentKeys[i];
        const [pitch, ...libraryStringParts] = instrumentKey.split('_')
        const libraryString = libraryStringParts.join('_').replace(/\.js$/, '');
        const libraryName = libraryString
            .replace(/_file$/, '')
            .replace(/_sf2$/, '')
        yield {
            title: `${libraryName}/${instrumentNames[parseInt(pitch)]}`,
            instrument: WebAudioFontInstrumentLoader,
            config: {
                instrumentPath: `i/${instrumentKey}.json`
            }
        }
    }
}

async function* listDrumAndDrumSets(): AsyncGenerator<InstrumentPreset<WebAudioFontInstrumentLoaderConfig>> {
    // TODO: fetch
    const {default: drumKeys} = await import("./drumKeys.json");
    const {default: drumSets} = await import("./drumSets.json");
    const {default: drumNames} = await import("./drumNames.json");
    // const drumSetKeys = Object.keys(drumSets);
    for (let i = 0; i < drumKeys.length; i++) {
        const drumKey = drumKeys[i];
        const [pitch, drumSetID, ...libraryStringParts] = drumKey.split('_')
        const libraryString = libraryStringParts.join('_').replace(/\.js$/, '');
        const drumSetName = drumSets[libraryString as keyof typeof drumSets][parseInt(drumSetID)];
        const libraryName = libraryString
            .replace(/_file$/, '')
            .replace(/_sf2$/, '')
        yield {
            title: `${libraryName}/${drumSetName}/${drumNames[pitch as keyof typeof drumNames]}`,
            instrument: WebAudioFontInstrumentLoader,
            config: {
                instrumentPath: `d/${drumKey}.json`
            }
        }
    }
}

