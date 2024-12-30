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
    await (track.destination.context as AudioContext).suspend()
    let fontConfig: WebAudioFontInstrumentConfig = await fetchJSONFromMirror(presetPath);
    await (track.destination.context as AudioContext).resume()

    const syncTime = audioContext.currentTime - (track.currentTime + track.bufferDuration);
    if (syncTime > 0) {
        track.currentTime = audioContext.currentTime // Move track time forward to compensate for loading time
        console.error(`WebAudioFontInstrumentLoader continued loading past buffer (${syncTime}). Syncing currentTime to `, track.currentTime)
    }
    return WebAudioFontInstrument(track, fontConfig)
}

export default WebAudioFontInstrumentLoader;
