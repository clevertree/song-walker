import {
    InstrumentInstance,
    TrackState, CommandState
} from "@songwalker/types";
import {parseNote} from "@songwalker";
import WebAudioFontPlayer from "./src/player";
import {Simulate} from "react-dom/test-utils";
import load = Simulate.load;


export interface WebAudioFontInstrumentConfig {
    title?: string,
    instrumentKey: string,
}

// export interface VoiceConfiguration {
//     alias?: string
//     preset: InstrumentPreset
// }


export default async function WebAudioFontInstrument(this: TrackState, config: WebAudioFontInstrumentConfig): Promise<InstrumentInstance> {

    // const {
    //     WebAudioFontPlayer,
    // } = await fetchWebAudioFontPlayer();
    const {
        destination: {
            context: audioContext
        }
    } = this;
    const startTime = audioContext.currentTime;
    const {
        instrumentKey
    } = config;
    const fontConfig = await fetchWebAudioFontConfig(instrumentKey);
    const player = new WebAudioFontPlayer();
    await player.adjustPreset(audioContext, fontConfig);

    const loadingTime = audioContext.currentTime;
    if (loadingTime > 0) {
        this.currentTime += loadingTime // Move track time forward to compensate for loading time
        console.log("WebAudioFontInstrument Loading time: ", loadingTime)
    }

    return function playWebAudioFontNote(commandState: CommandState) {
        const {
            destination,
            currentTime,
            noteDuration = 0,
            beatsPerMinute
        } = commandState;
        const {frequency} = parseNote(commandState.command);
        const pitch = (Math.log(frequency) / Math.log(2)) * 12
        // const playbackRate = Math.pow(2, (100.0 * pitch) / 1200.0);
        const duration = noteDuration * (60 / beatsPerMinute)
        player.queueWaveTable(audioContext, destination, fontConfig, currentTime, pitch, duration);
    }
}

interface WebAudioFontClasses {
    WebAudioFontPlayer: any
    // WebAudioFontLoader: any
}

let loadedClasses: WebAudioFontClasses | null = null;

export async function fetchWebAudioFontPlayer(): Promise<WebAudioFontClasses> {
    if (loadedClasses)
        return loadedClasses;
    const response = await fetch('https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js');
    const source = await response.text();
    eval(source + `loadedClasses = {WebAudioFontPlayer}`);
    if (!loadedClasses)
        throw new Error("Unable to load classes");
    return loadedClasses as WebAudioFontClasses;
}

export async function fetchWebAudioFontConfig(instrumentKey: string) {
    const fontURL = 'https://surikov.github.io/webaudiofontdata/sound/' + instrumentKey + '.js'
    const request = await fetch(fontURL);
    let fontJS = await request.text();
    fontJS = fontJS.replaceAll(`_tone_${instrumentKey}`, '_config')
        .replace("console.log('load _config');", '');
    fontJS = `(() => {${fontJS}; return _config;})()`
    const config = eval(fontJS);
    if (!config)
        throw new Error("Unable to evaluate webfont: " + fontURL);
    console.log("fetchWebAudioFontConfig: ", config)
    return config;
}
