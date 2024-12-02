import {InstrumentPreset, PresetBank} from "@songwalker/types";
import WebAudioFontInstrument, {
    WebAudioFontInstrumentConfig
} from "@songwalker-presets/WebAudioFont/WebAudioFontInstrument";

export const WebAudioFontLibrary: PresetBank = {
    title: 'WebAudioFont',
    async* listPresets() {
        yield* listInstruments()
        yield* listDrumAndDrumSets();
    },
}

async function* listInstruments(): AsyncGenerator<InstrumentPreset<WebAudioFontInstrumentConfig>> {
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
            instrument: WebAudioFontInstrument,
            config: {
                instrumentKey
            }
        }
    }
}

async function* listDrumAndDrumSets(): AsyncGenerator<InstrumentPreset<WebAudioFontInstrumentConfig>> {
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
            instrument: WebAudioFontInstrument,
            config: {
                instrumentKey: drumKey // todo;
            }
        }
    }
}

