import {TrackState} from "@songwalker";
import {InstrumentLoader} from "@songwalker/types";

export interface DelayEffectConfig {
    duration?: number,
    // feedback?: number,
    // cutoff?: number,
    // offset?: number,
    feedback?: number
    wet?: number
    dry?: number
}

const DelayEffect: InstrumentLoader<DelayEffectConfig> = (songState, config) => {
    const {
        context: audioContext
    } = songState;

    return function connectDelayEffect(track: TrackState) {
        const {
            destination,
            beatsPerMinute
        } = track;
        const {
            feedback = 0.5,
            wet = 0.5,
            dry = 1,
            duration = 1,
        } = config;

        const delayTime = duration * (60 / beatsPerMinute);

        const effectDestination = new GainNode(audioContext);
        const delayNode = new DelayNode(audioContext, {delayTime})
        const feedbackNode = new GainNode(audioContext, {gain: feedback})

        // Connect Delay node and setup feedback
        delayNode.connect(destination)
        feedbackNode.connect(delayNode)
        delayNode.connect(feedbackNode)

        // Mixer
        const wetGain = new GainNode(audioContext, {gain: wet});
        const dryGain = new GainNode(audioContext, {gain: dry});
        wetGain.connect(feedbackNode)
        dryGain.connect(destination)

        // Connect to destination
        effectDestination.connect(wetGain);
        effectDestination.connect(dryGain);

        // Return new track state object
        return {
            ...track,
            destination: effectDestination
        }
    }
}

export default DelayEffect
// Effect may encapsulate current instrument to modify commands in real-time