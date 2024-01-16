import {PlayNoteEvent} from "@songwalker/walker";
import {InstrumentInstance, InstrumentPreset} from "@songwalker/types";
import EnvelopeEffect, {EnvelopeEffectConfig} from "../effects/Envelope";


export interface AudioBufferInstrumentConfig {
    title?: string,
    url: string,
    loopStart?: number,
    loopEnd?: number,
    detune?: number,
    envelope?: EnvelopeEffectConfig
}

export type AudioBufferInstrumentPreset = InstrumentPreset<AudioBufferInstrumentConfig>

export default function AudioBufferInstrument(config: AudioBufferInstrumentConfig): InstrumentInstance {
    console.log('AudioBufferInstrument', config, config.title);
    // let activeAudioBuffers = [];
    let createEnvelope = EnvelopeEffect(config.envelope)

    // TODO?
    // return function(eventName, ...args) {
    return function (noteEvent: PlayNoteEvent) {
        const {value, startTime, duration, velocity} = noteEvent;
        const endTime = startTime + duration;
        const velocityGainNode = createEnvelope(noteEvent);

        // Audio Buffer
        const audioBuffer = velocityGainNode.context.createBufferSource();

        if (typeof config.detune !== "undefined")
            audioBuffer.detune.setValueAtTime(config.detune, startTime); // value in cents
        audioBuffer.start(startTime);
        audioBuffer.stop(endTime);

        // TODO: implement noteOff / release
        return audioBuffer;
    }
}