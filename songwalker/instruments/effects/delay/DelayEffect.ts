import {CommandWithParams, InstrumentInstance, TrackState} from "@songwalker";

export interface DelayEffectConfig {
    duration?: number,
    // feedback?: number,
    // cutoff?: number,
    // offset?: number,
    feedback?: number
    wet?: number
    dry?: number
}

export default async function DelayEffect(track: TrackState, config: DelayEffectConfig): Promise<InstrumentInstance> {
    const {
        destination: {
            context: audioContext
        }
    } = track;

    // this.effects.push(analyzerEffect)
    function connectDelayEffect(track: TrackState, commandWithParams: CommandWithParams) {
        const {
            destination,
            beatsPerMinute
        } = {...track, ...commandWithParams};
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
        commandWithParams.destination = effectDestination;
    }

    // Don't automatically append effect to track state
    // track.effects.push(connectDelayEffect)
    return connectDelayEffect;

}

// Effect may encapsulate current instrument to modify commands in real-time
