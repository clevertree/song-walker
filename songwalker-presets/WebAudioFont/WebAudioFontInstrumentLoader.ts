import {
    InstrumentInstance,
    TrackState
} from "@songwalker/types";
import WebAudioFontInstrument, {
    WebAudioFontInstrumentConfig
} from "@songwalker-presets/WebAudioFont/WebAudioFontInstrument";


export interface WebAudioFontInstrumentLoaderConfig {
    title?: string,
    instrumentPath: string,
}

// export interface VoiceConfiguration {
//     alias?: string
//     preset: InstrumentPreset
// }


export default async function WebAudioFontInstrumentLoader(this: TrackState, config: WebAudioFontInstrumentLoaderConfig): Promise<InstrumentInstance> {
    const {
        destination: {
            context: audioContext
        }
    } = this;
    const startTime = audioContext.currentTime;
    const {
        instrumentPath
    } = config;
    const chosenMirrorID = Math.floor(Math.random() * URL_MIRROR.length);
    const fontURL = URL_MIRROR[chosenMirrorID] + instrumentPath
    const request = await fetch(fontURL);
    const fontConfig: WebAudioFontInstrumentConfig = await request.json();

    const loadingTime = audioContext.currentTime - startTime;
    if (loadingTime > 0) {
        this.currentTime += loadingTime // Move track time forward to compensate for loading time
        console.log("WebAudioFont preset loading time: ", loadingTime)
    }

    return WebAudioFontInstrument.bind(this)(fontConfig)
}

const URL_MIRROR = [
    'https://webaudiofontdata.clevertree.net/',
    'https://clevertree.github.io/webaudiofontdata/'
];
