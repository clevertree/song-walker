import {
    InstrumentInstance,
    InstrumentPreset,
    TrackState, CommandState
} from "@songwalker/types";
import {parseNote} from "@songwalker";


export interface WebAudioFontInstrumentConfig {
    title?: string,
    instrumentKey: string,
}

// export interface VoiceConfiguration {
//     alias?: string
//     preset: InstrumentPreset
// }


export default async function WebAudioFontInstrument(this: TrackState, config: WebAudioFontInstrumentConfig): Promise<InstrumentInstance> {

    const {
        instrumentKey
    } = config;
    const fontConfig = await fetchWebAudioFontConfig(instrumentKey);

    const {
        WebAudioFontPlayer,
    } = await fetchWebAudioFontPlayer();
    const {
        destination: {
            context: audioContext
        }
    } = this;
    // var selectedPreset=_tone_0000_JCLive_sf2_file;
    // var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
    // var audioContext = new AudioContextFunc();
    const player = new WebAudioFontPlayer();
    player.adjustPreset(audioContext, fontConfig);
    for (let i = 0; i < 100; i++) {
        if (fontConfig.zones.every((zone: any) => !!zone.buffer))
            break;
        console.log("Waiting for all buffers to load");
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    // player.loader.decodeAfterLoading(audioContext, '_tone_0000_JCLive_sf2_file');

    return function playWebAudioFontNote(commandState: CommandState) {
        const {
            destination,
            currentTime,
            noteDuration = 0,
            beatsPerMinute
        } = commandState;
        const {frequency} = parseNote(commandState.command);
        const pitch = (Math.log(frequency) / Math.log(2)) * 12
        const playbackRate = Math.pow(2, (100.0 * pitch) / 1200.0);
        player.queueWaveTable(audioContext, destination, fontConfig, currentTime, pitch, noteDuration * (60 / beatsPerMinute));
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
    fontJS = fontJS.replaceAll(`_tone_${instrumentKey}`, '_config');
    fontJS = `(() => {${fontJS}; return _config;})()`
    const config = eval(fontJS);
    if (!config)
        throw new Error("Unable to evaluate webfont: " + fontURL);
    return config;
}
