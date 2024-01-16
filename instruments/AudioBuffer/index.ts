import {PlayNoteEvent} from "@songwalker/walker";
import {InstrumentInstance} from "@songwalker/types";
import EnvelopeEffect, {EnvelopeEffectConfig} from "../effects/Envelope";


export interface AudioBufferInstrumentConfig {
    title?: string,
    src: string | ArrayBuffer,
    loopStart?: number,
    loopEnd?: number,
    detune?: number,
    envelope?: EnvelopeEffectConfig
}


export default async function AudioBufferInstrument(config: AudioBufferInstrumentConfig, context: BaseAudioContext): Promise<InstrumentInstance> {
    const {envelope, detune, title, src} = config;
    console.log('AudioBufferInstrument', config, title);
    // let activeAudioBuffers = [];
    let createEnvelope = EnvelopeEffect(envelope)
    let arrayBuffer: ArrayBuffer;
    if (typeof src === "string") {
        const response = await fetch(src);
        arrayBuffer = await response.arrayBuffer();
    } else {
        arrayBuffer = src;
    }
    const audioBuffer = await context.decodeAudioData(arrayBuffer);

    // TODO?
    // return function(eventName, ...args) {
    return function (noteEvent: PlayNoteEvent) {
        const {startTime, duration} = noteEvent;
        const endTime = startTime + duration;
        const velocityGainNode = createEnvelope(noteEvent);

        // Audio Buffer
        const bufferNode = velocityGainNode.context.createBufferSource();
        bufferNode.buffer = audioBuffer;

        if (typeof detune !== "undefined")
            bufferNode.detune.setValueAtTime(detune, startTime); // value in cents
        bufferNode.connect(velocityGainNode);
        bufferNode.start(startTime);
        bufferNode.stop(endTime);

        // TODO: implement noteOff / release
        return bufferNode;
    }
}