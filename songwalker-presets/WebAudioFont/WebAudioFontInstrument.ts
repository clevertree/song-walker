import {CommandWithParams, InstrumentInstance, TrackState} from "@songwalker/types";
import {parseNote} from "@songwalker";
import WebAudioFontPlayer from "./src/player";
import {WavePreset} from "@songwalker-presets/WebAudioFont/src/otypes";
import DrumToMIDI from "@songwalker/constants/drumToMIDI";


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
            context: audioContext
        }
    } = track;
    const player = new WebAudioFontPlayer();
    await player.adjustPreset(audioContext, config);

    const syncTime = audioContext.currentTime - (track.currentTime + track.bufferDuration);
    if (syncTime > 0) {
        track.currentTime = audioContext.currentTime // Move track time forward to compensate for loading time
        console.error(`WebAudioFontInstrument continued loading past buffer (${syncTime}). Syncing currentTime to `, track.currentTime)
    }

    return function playWebAudioFontNote(track: TrackState, commandWithParams: CommandWithParams) {
        const {
            commandString,
            destination,
            startTime,
            duration,
            beatsPerMinute
        } = {...track, ...commandWithParams};
        let pitch: number;
        if (typeof DrumToMIDI[commandString] !== 'undefined') {
            pitch = DrumToMIDI[commandString]
        } else {
            const {frequency} = parseNote(commandString);
            pitch = (Math.log(frequency) / Math.log(2)) * 12
        }
        // const playbackRate = Math.pow(2, (100.0 * pitch) / 1200.0);
        const durationSeconds = duration * (60 / beatsPerMinute)
        player.queueWaveTable(audioContext, destination, config, startTime, pitch, durationSeconds);
    }
}
