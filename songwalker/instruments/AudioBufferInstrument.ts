import {InstrumentInstance, CommandParams, ParsedNote, TrackState} from "@songwalker/types";
import {parseNote} from "..";
import {configEnvelope, EnvelopeConfig} from "./common/envelope";
import {configFilterByKeyRange, configFilterByCurrentTime, KeyRangeConfig} from "./common/filter";

const DEFAULT_FREQUENCY_ROOT = 220;


export interface AudioBufferInstrumentConfig extends EnvelopeConfig, KeyRangeConfig {
    title?: string,
    src: string | AudioBuffer,
    loop?: boolean,
    loopStart?: number,
    loopEnd?: number,
    detune?: number,
    frequencyRoot?: number | string
}

export default async function AudioBufferInstrument(config: AudioBufferInstrumentConfig): Promise<InstrumentInstance> {
    // console.log('AudioBufferInstrument', config, title);

    let createSourceNode = await configAudioBuffer();
    let createGain = configEnvelope(config);
    let filterNote = configFilterByKeyRange(config, configFilterByCurrentTime())

    return function parseCommand(noteCommand: string, trackState: TrackState, noteParams: CommandParams) {
        // TODO: check alias
        switch (noteCommand) {
            case 'play':
            case 'stop':
        }
        const noteInfo = parseNote(noteCommand);
        if (!noteInfo)
            throw new Error("Unrecognized note: " + noteCommand);
        const trackStateWithParams: TrackState = {...trackState, ...noteParams};
        if (filterNote(noteInfo, trackStateWithParams))
            return
        return playAudioBuffer(noteInfo, trackStateWithParams)
    }

    function playAudioBuffer(noteInfo: ParsedNote, trackState: TrackState) {
        let {
            beatsPerMinute,
            currentTime,
            noteDuration,
        } = trackState;

        // Envelope
        const gainNode = createGain(trackState);
        // Audio Buffer
        const bufferNode = createSourceNode(noteInfo, gainNode)

        bufferNode.start(currentTime);
        if (noteDuration) {
            const endTime = currentTime + (noteDuration * (60 / beatsPerMinute));
            bufferNode.stop(endTime);
        }
        // TODO: add active notes to track state?
        return bufferNode;
    }

    async function configAudioBuffer() {
        let {
            src,
            loop = false,
            frequencyRoot = DEFAULT_FREQUENCY_ROOT,
            detune = 0
        } = config;
        let audioBuffer: AudioBuffer;
        if (typeof src === "string") {
            audioBuffer = await getCachedAudioBuffer(src);
        } else {
            audioBuffer = src;
        }
        const parsedFrequencyRoot = getFrequencyRoot(frequencyRoot);
        return (noteInfo: ParsedNote, destination: AudioNode) => {
            const {frequency} = noteInfo;
            const bufferNode = destination.context.createBufferSource();
            bufferNode.buffer = audioBuffer;
            bufferNode.detune.value = detune
            bufferNode.loop = loop;
            bufferNode.playbackRate.value = frequency / parsedFrequencyRoot;
            // Connect Source
            bufferNode.connect(destination);
            return bufferNode;
        }
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
    return frequencyRoot || DEFAULT_FREQUENCY_ROOT;
}
