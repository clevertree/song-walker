import {InstrumentLoader, SongWalkerState} from "@songwalker/types";
import WebAudioFontInstrument, {
    WebAudioFontInstrumentConfig
} from "@songwalker-presets/WebAudioFont/WebAudioFontInstrument";
import {fetchJSONFromMirror} from "@songwalker-presets/WebAudioFont/mirrors";


export interface WebAudioFontInstrumentLoaderConfig {
    title?: string,
    presetPath: string,
}

// export interface VoiceConfiguration {
//     alias?: string
//     preset: InstrumentPreset
// }


const WebAudioFontInstrumentLoader: InstrumentLoader<WebAudioFontInstrumentLoaderConfig> = async function (songState: SongWalkerState, config) {
    const {
        context: audioContext,
        rootTrackState
    } = songState;
    const {
        presetPath
    } = config;
    let fontConfig: WebAudioFontInstrumentConfig = await fetchJSONFromMirror(presetPath);

    const syncTime = audioContext.currentTime - rootTrackState.currentTime;
    if (syncTime > 0) {
        console.error(`WebAudioFontInstrumentLoader continued loading past buffer (${syncTime}).`)
    }
    return WebAudioFontInstrument(songState, fontConfig)
}

export default WebAudioFontInstrumentLoader;
