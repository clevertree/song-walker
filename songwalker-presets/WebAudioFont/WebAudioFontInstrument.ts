import {
    InstrumentInstance,
    TrackState, CommandState
} from "@songwalker/types";
import {parseNote} from "@songwalker";
import WebAudioFontPlayer from "./src/player";
import {Simulate} from "react-dom/test-utils";
import load = Simulate.load;
import {WavePreset} from "@songwalker-presets/WebAudioFont/src/otypes";


export interface WebAudioFontInstrumentConfig extends WavePreset {
    title?: string,
}

// export interface VoiceConfiguration {
//     alias?: string
//     preset: InstrumentPreset
// }


export default async function WebAudioFontInstrument(this: TrackState, config: WebAudioFontInstrumentConfig): Promise<InstrumentInstance> {
    const {
        destination: {
            context: audioContext
        }
    } = this;
    const startTime = audioContext.currentTime;
    const player = new WebAudioFontPlayer();
    await player.adjustPreset(audioContext, config);

    const loadingTime = audioContext.currentTime - startTime;
    if (loadingTime > 0) {
        this.currentTime += loadingTime // Move track time forward to compensate for loading time
        console.log("WebAudioFont preset loading time: ", loadingTime)
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
        player.queueWaveTable(audioContext, destination, config, currentTime, pitch, duration);
    }
}
