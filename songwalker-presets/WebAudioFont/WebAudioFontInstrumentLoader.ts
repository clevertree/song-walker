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
    const startTime = audioContext.currentTime;
    const {
        presetPath
    } = config;
    let fontConfig: WebAudioFontInstrumentConfig = await fetchJSONFromMirror(presetPath);

    const loadingTime = audioContext.currentTime - startTime;
    if (loadingTime > 0) {
        track.currentTime += loadingTime // Move track time forward to compensate for loading time
        console.log("WebAudioFont preset loading time: ", loadingTime)
    }

    return WebAudioFontInstrument(track, fontConfig)
}

export default WebAudioFontInstrumentLoader;
