import {CommandParams, InstrumentInstance, TrackState} from "@songwalker/types";
import {parseNote} from "@songwalker";
import WebAudioFontPlayer from "./src/player";
import {WavePreset} from "@songwalker-presets/WebAudioFont/src/otypes";


export interface WebAudioFontInstrumentConfig extends WavePreset {
    title?: string,
}

// export interface VoiceConfiguration {
//     alias?: string
//     preset: InstrumentPreset
// }


export default async function WebAudioFontInstrument(track: TrackState, config: WebAudioFontInstrumentConfig): Promise<InstrumentInstance> {
    const {
        destination: {
            context
        }
    } = track;
    const startTime = context.currentTime;
    const player = new WebAudioFontPlayer();
    await player.adjustPreset(context, config);

    const loadingTime = context.currentTime - startTime;
    if (loadingTime > 0) {
        track.currentTime += loadingTime // Move track time forward to compensate for loading time
        console.log("WebAudioFont preset loading time: ", loadingTime)
    }

    return function playWebAudioFontNote(track: TrackState, command: string, params: CommandParams) {
        const {
            destination,
            currentTime,
            duration,
            beatsPerMinute
        } = {...track, ...params};
        const {frequency} = parseNote(command);
        const pitch = (Math.log(frequency) / Math.log(2)) * 12
        // const playbackRate = Math.pow(2, (100.0 * pitch) / 1200.0);
        const durationSeconds = duration * (60 / beatsPerMinute)
        player.queueWaveTable(context, destination, config, currentTime, pitch, durationSeconds);
    }
}
