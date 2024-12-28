import {InstrumentLoader, TrackState} from "@songwalker/types";
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


const WebAudioFontInstrumentLoader: InstrumentLoader<WebAudioFontInstrumentLoaderConfig> = async function (track: TrackState, config) {
    const {
        destination: {
            context: audioContext
        }
    } = track;
    const {
        presetPath
    } = config;
    let fontConfig: WebAudioFontInstrumentConfig = await fetchJSONFromMirror(presetPath);

    const syncTime = audioContext.currentTime - track.currentTime;
    if (syncTime > 0) {
        track.currentTime = audioContext.currentTime  // Move track time forward to compensate for loading time
        console.log("WebAudioFontLoader loading syncs currentTime to ", track.currentTime)
    }
    return WebAudioFontInstrument(track, fontConfig)
}

export default WebAudioFontInstrumentLoader;
