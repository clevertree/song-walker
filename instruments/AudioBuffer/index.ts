import {PlayNoteEvent} from "@songwalker/walker";
import {InstrumentInstance} from "@songwalker/types";
import EnvelopeEffect, {EnvelopeEffectConfig} from "../effects/Envelope";


export interface AudioBufferInstrumentConfig {
    title?: string,
    src: string | AudioBuffer,
    loopStart?: number,
    loopEnd?: number,
    detune?: number,
    envelope?: EnvelopeEffectConfig
}


export default async function AudioBufferInstrument(config: AudioBufferInstrumentConfig, context: BaseAudioContext): Promise<InstrumentInstance> {
    const {envelope, detune, title, src} = config;
    // console.log('AudioBufferInstrument', config, title);
    // let activeAudioBuffers = [];
    let createEnvelope = EnvelopeEffect(envelope)
    let audioBuffer: AudioBuffer;
    if (typeof src === "string") {
        audioBuffer = await getCachedAudioBuffer(src, context);
    } else {
        audioBuffer = src;
    }

    return function (noteEvent: PlayNoteEvent) {
        const {startTime, duration, velocity, destination} = noteEvent;
        let gainNode: AudioNode = destination;
        if (velocity) {
            gainNode = createEnvelope(noteEvent);
        }

        // Audio Buffer
        const bufferNode = destination.context.createBufferSource();
        bufferNode.buffer = audioBuffer;

        if (typeof detune !== "undefined")
            bufferNode.detune.setValueAtTime(detune, startTime); // value in cents
        bufferNode.connect(gainNode);
        bufferNode.start(startTime);
        if (duration) {
            const endTime = startTime + duration;
            bufferNode.stop(endTime);
        }
        // TODO: implement noteOff / release
        return bufferNode;
    }
}

let cache = new Map<string, AudioBuffer>();


async function getCachedAudioBuffer(src: string, context: BaseAudioContext): Promise<AudioBuffer> {
    if (cache.has(src))
        return cache.get(src) as AudioBuffer;
    const response = await fetch(src);
    if (response.status !== 200)
        throw new Error(`Failed to fetch audio file (${response.status} ${response.statusText}): ${src}`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    cache.set(src, audioBuffer);
    return audioBuffer;
}