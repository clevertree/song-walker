import {InstrumentInstance, ParsedCommandParams, TrackState} from "@songwalker/types";
import {parseNote} from "@songwalker";


export interface AudioBufferInstrumentConfig {
    title?: string,
    src: string | AudioBuffer,
    loop?: boolean,
    loopStart?: number,
    loopEnd?: number,
    detune?: number,
    frequencyRoot?: number | string,
    keyRangeLow?: string,
    keyRangeHigh?: string,
    mixer?: number,
    attack?: number,
    // hold?: number,
    // decay?: number,
    // sustain?: number,
    release?: number
}


export default async function AudioBufferInstrument(config: AudioBufferInstrumentConfig): Promise<InstrumentInstance> {
    const {
        frequencyRoot, detune, loop, title, src
    } = config;
    // console.log('AudioBufferInstrument', config, title);
    // let activeAudioBuffers = [];
    // let createEnvelope = EnvelopeEffect(envelope)
    let audioBuffer: AudioBuffer;
    if (typeof src === "string") {
        audioBuffer = await getCachedAudioBuffer(src);
    } else {
        audioBuffer = src;
    }

    return function (noteCommand: string, trackState: TrackState, noteParams: ParsedCommandParams) {
        const noteInfo = parseNote(noteCommand);
        if (!noteInfo)
            throw new Error("Unrecognized note: " + noteCommand);
        const {frequency} = noteInfo;
        // TODO: key range
        let {
            beatsPerMinute,
            currentTime,
            noteDuration,
            noteVelocity,
            destination
        } = {...trackState, ...noteParams};
        const audioContext = destination.context;
        if (currentTime < audioContext.currentTime) {
            console.warn("skipping note that occurs in the past: ", noteCommand, currentTime, '<', audioContext.currentTime)
            return
        }

        let amplitude = config.mixer || 1;
        if (noteVelocity)
            amplitude *= noteVelocity;
        let gainNode = destination.context.createGain();
        gainNode.connect(destination);

        // Attack is the time taken for initial run-up of level from nil to peak, beginning when the key is pressed.
        if (config.attack) {
            gainNode.gain.value = 0;
            gainNode.gain.linearRampToValueAtTime(amplitude, currentTime + (config.attack / 1000));
        } else {
            gainNode.gain.value = amplitude;
        }

        // Audio Buffer
        const bufferNode = audioContext.createBufferSource();
        bufferNode.buffer = audioBuffer;

        if (typeof detune !== "undefined")
            bufferNode.detune.setValueAtTime(detune, currentTime); // value in cents
        if (frequencyRoot)
            bufferNode.playbackRate.value = frequency / getFrequencyRoot(frequencyRoot);

        if (typeof loop !== "undefined") {
            bufferNode.loop = loop;
        }

        bufferNode.connect(gainNode);
        bufferNode.start(currentTime);
        if (noteDuration) {
            const endTime = currentTime + (noteDuration * (60 / beatsPerMinute));
            bufferNode.stop(endTime);
        }
        // TODO: implement noteOff / release
        return bufferNode;
    }
}

let cache = new Map<string, AudioBuffer>();

let loaderContext: BaseAudioContext;

async function getCachedAudioBuffer(src: string): Promise<AudioBuffer> {
    if (cache.has(src))
        return cache.get(src) as AudioBuffer;
    if (typeof loaderContext === "undefined")
        loaderContext = new AudioContext();
    const response = await fetch(src);
    if (response.status !== 200)
        throw new Error(`Failed to fetch audio file (${response.status} ${response.statusText}): ${src}`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await loaderContext.decodeAudioData(arrayBuffer);
    cache.set(src, audioBuffer);
    return audioBuffer;
}


function getFrequencyRoot(frequencyRoot: number | string | null) {
    if (typeof frequencyRoot === "string") {
        const rootInfo = parseNote(frequencyRoot);
        if (!rootInfo)
            throw new Error("Invalid root frequency: " + frequencyRoot)
        return rootInfo.frequency;
    }
    return frequencyRoot || 220;
}
