import {InstrumentPreset, PresetBank} from "@songwalker/types";
import WebAudioFontInstrumentLoader, {
    WebAudioFontInstrumentLoaderConfig
} from "@songwalker-presets/WebAudioFont/WebAudioFontInstrumentLoader";
import {fetchJSONFromMirror} from "@songwalker-presets/WebAudioFont/mirrors";

export const PRESET_PATH_INSTRUMENT_KEYS = '/instrumentKeys.json'
export const PRESET_PATH_INSTRUMENT_NAMES = '/instrumentNames.json'
export const PRESET_PATH_PERCUSSION_KEYS = '/percussionKeys.json'
export const PRESET_PATH_PERCUSSION_NAMES = '/percussionNames.json'
export const PRESET_PATH_DRUMSET_KEYS = '/drumSets.json'
export const PRESET_PATH_INSTRUMENT = '/i'
export const PRESET_PATH_PERCUSSION = '/p'
export const PRESET_PATH_DRUMSET = '/s'

export const WebAudioFontLibrary: PresetBank = {
    title: 'WebAudioFont',
    async* listPresets() {
        yield* listInstruments()
        yield* listDrumAndDrumSets();
    },
}

async function* listInstruments(): AsyncGenerator<InstrumentPreset<WebAudioFontInstrumentLoaderConfig>> {
    let instrumentKeys = await fetchJSONFromMirror(PRESET_PATH_INSTRUMENT_KEYS);
    let instrumentNames = await fetchJSONFromMirror(PRESET_PATH_INSTRUMENT_NAMES);
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
                presetPath: `${PRESET_PATH_INSTRUMENT}/${instrumentKey}.json`
            }
        }
    }
}

async function* listDrumAndDrumSets(): AsyncGenerator<InstrumentPreset<WebAudioFontInstrumentLoaderConfig>> {
    let drumKeys = await fetchJSONFromMirror(PRESET_PATH_PERCUSSION_KEYS);
    let drumNames = await fetchJSONFromMirror(PRESET_PATH_PERCUSSION_NAMES);
    let drumSets = await fetchJSONFromMirror(PRESET_PATH_DRUMSET_KEYS);
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
                presetPath: `${PRESET_PATH_PERCUSSION}/${drumKey}.json`
            }
        }
    }
}

