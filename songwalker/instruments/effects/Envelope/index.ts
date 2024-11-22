import {InstrumentInstance, TrackState} from "@songwalker";

const DEFAULT_VELOCITY = 1;

export type EnvelopeEffectConfig = {
    mixer?: number,
    attack?: number,
    // hold?: number,
    // decay?: number,
    // sustain?: number,
    release?: number
}

// export type EnvelopeEffectPreset = InstrumentPreset<EnvelopeEffectConfig>

export default function EnvelopeEffect(config: EnvelopeEffectConfig = {}): InstrumentInstance {
    // console.log('EnvelopeEffect', config, config.mixer);
    // const destination = audioCtx.destination;
    // let activeOscillators = [];
    return function (trackState: TrackState, noteCommand: string) {
        const {destination, currentTime, noteDuration, noteVelocity} = trackState;
        let amplitude = config.mixer || 1;
        if (params) {
            if (params.duration)
                noteDuration = params.duration
            // if(params.velocity)
            //     noteVelocity = params.velocity
        }
        if (noteVelocity)
            amplitude *= noteVelocity;
        let source = destination.context.createGain();
        source.connect(destination);

        // Attack is the time taken for initial run-up of level from nil to peak, beginning when the key is pressed.
        if (config.attack) {
            source.gain.value = 0;
            source.gain.linearRampToValueAtTime(amplitude, currentTime + (config.attack / 1000));
        } else {
            source.gain.value = amplitude;
        }
        return source;
        // const endTime = startTime + duration;
        // const oscillator = audioCtx.createOscillator();
        // oscillator.frequency.value = frequency;
        // if (typeof config.detune === "undefined")
        //     oscillator.frequency.detune = config.detune;
        // oscillator.connect(destination);
        // oscillator.start(startTime);
        // oscillator.stop(endTime);
        // activeOscillators.push(oscillator);
        //
        // // console.log("note start: ", {frequency, startTime, duration});
        // oscillator.onended = () => {
        //     // console.log("note finished: ", {frequency, startTime, duration});
        //     const index = activeOscillators.indexOf(oscillator);
        //     if (index > 1)
        //         activeOscillators.splice(index, 1)
        // };
    }
}

