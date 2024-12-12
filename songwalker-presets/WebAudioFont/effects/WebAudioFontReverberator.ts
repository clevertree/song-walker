import {CommandState, InstrumentInstance, TrackState} from "@songwalker/types";
import {parseNote} from "@songwalker";
import Reverberator, {WebAudioFontReverberatorConfig} from "../src/reverberator";


// export interface VoiceConfiguration {
//     alias?: string
//     preset: InstrumentPreset
// }


export default async function WebAudioFontReverberatorEffect(this: TrackState, config: WebAudioFontReverberatorConfig): Promise<InstrumentInstance> {
    const {
        destination: {
            context
        }
    } = this;
    const startTime = context.currentTime;
    const reverb = new Reverberator(context, config);
    // Switch destination in track state

    channelMaster.output.connect(reverberator.input);
    var flanger=new flangerNode(audioContext,reverberator.output,audioContext.destination);
    const oldDestination = this.destination;
    this.destination =

    const loadingTime = context.currentTime - startTime;
    if (loadingTime > 0) {
        this.currentTime += loadingTime // Move track time forward to compensate for loading time
        console.log("WebAudioFont preset loading time: ", loadingTime)
    }

    const reverbEffect: InstrumentInstance = () => {

    }
    // this.effects.push(analyzerEffect)
    return reverbEffect;

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
        player.queueWaveTable(context, destination, config, currentTime, pitch, duration);
    }
}
