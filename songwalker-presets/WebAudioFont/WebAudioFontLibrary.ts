import {InstrumentPreset, PresetBank, PresetFilter} from "@songwalker/types";
import WebAudioFontInstrumentLoader, {
    WebAudioFontInstrumentLoaderConfig
} from "@songwalker-presets/WebAudioFont/WebAudioFontInstrumentLoader";
import {fetchJSONFromMirror} from "@songwalker-presets/WebAudioFont/mirrors";

export const PRESET_PATH_INSTRUMENT_KEYS = '/instrumentKeys.json'
export const PRESET_PATH_INSTRUMENT_NAMES = '/instrumentNames.json'
export const PRESET_PATH_PERCUSSION_KEYS = '/percussionKeys.json'
export const PRESET_PATH_PERCUSSION_NAMES = '/percussionNames.json'
export const PRESET_PATH_DRUMSET_KEYS = '/drumSetKeys.json'
export const PRESET_PATH_DRUMSET_NAMES = '/drumSetNames.json'
export const PRESET_PATH_INSTRUMENT = '/i'
export const PRESET_PATH_PERCUSSION = '/p'
export const PRESET_PATH_DRUMSET = '/s'

export const WebAudioFontLibrary: PresetBank = {
    title: 'WebAudioFont',
    async* listPresets(presetFilter) {
        const {type} = presetFilter
        if (type === 'any' || type === 'melodic')
            yield* listInstruments()
        if (type === 'any' || type === 'percussion' || type === 'drum-kit')
            yield* listDrumAndDrumSets(presetFilter)
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
        const instrumentName = instrumentNames[parseInt(pitch.substring(0, 3))];
        if (!instrumentName)
            throw new Error(`Invalid instrument name (pitch = ${pitch})`)
        yield {
            title: `${libraryName}/${instrumentName}`,
            instrument: WebAudioFontInstrumentLoader,
            type: 'melodic',
            config: {
                presetPath: `${PRESET_PATH_INSTRUMENT}/${instrumentKey}.json`
            }
        }
    }
}

async function* listDrumAndDrumSets(presetFilter: PresetFilter): AsyncGenerator<InstrumentPreset<WebAudioFontInstrumentLoaderConfig>> {
    const {type} = presetFilter
    let drumKeys = await fetchJSONFromMirror(PRESET_PATH_PERCUSSION_KEYS);
    let drumNames = await fetchJSONFromMirror(PRESET_PATH_PERCUSSION_NAMES);
    // let drumSets = await fetchJSONFromMirror(PRESET_PATH_DRUMSET_KEYS);
    let drumSetNames = await fetchJSONFromMirror(PRESET_PATH_DRUMSET_NAMES);
    // const drumSetKeys = Object.keys(drumSets);
    // Loop through drum-sets first
    if (type === 'any' || type === 'drum-kit') {
        const drumSetLibraryKeys = Object.keys(drumSetNames)
        for (const drumSetLibraryKey of drumSetLibraryKeys) {
            const drumSets = drumSetNames[drumSetLibraryKey];
            for (let i = 0; i < drumSets.length; i++) {
                const drumSetName = drumSets[i];
                const presetName = `${drumSetLibraryKey}_${drumSetName}`
                    .replaceAll(' ', '_')
                yield {
                    title: `${drumSetLibraryKey}/${drumSetName}`,
                    type: 'drum-kit',
                    instrument: WebAudioFontInstrumentLoader,
                    config: {
                        presetPath: `${PRESET_PATH_DRUMSET}/${presetName}.json`
                    }
                }
            }
        }
    }

    if (type === 'any' || type === 'percussion') {
        // Loop though all percussion instruments
        for (let i = 0; i < drumKeys.length; i++) {
            const drumKey = drumKeys[i];
            const [pitch, drumSetID, ...libraryStringParts] = drumKey.split('_')
            const libraryString = libraryStringParts.join('_').replace(/\.js$/, '')
                .replace(/_file$/, '')
                .replace(/_sf2$/, '')
            const drumSetName = drumSetNames[libraryString as keyof typeof drumSetNames][parseInt(drumSetID)];
            yield {
                title: `${libraryString}/${drumSetName}/${drumNames[pitch as keyof typeof drumNames]}`,
                instrument: WebAudioFontInstrumentLoader,
                type: 'percussion',
                config: {
                    presetPath: `${PRESET_PATH_PERCUSSION}/${drumKey}.json`
                }
            }
        }
    }
}

