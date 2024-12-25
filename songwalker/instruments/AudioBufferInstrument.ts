import {CommandState, InstrumentInstance, ParsedNote, TrackState} from "@songwalker/types";
import {parseNote} from "..";
import {configEnvelope, EnvelopeConfig} from "./common/envelope";
import {configFilterByKeyRange, KeyRangeConfig} from "./common/filter";
import {defaultEmptyInstrument} from "@songwalker/helper/songHelper";

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

export default async function AudioBufferInstrument(this: TrackState, config: AudioBufferInstrumentConfig): Promise<InstrumentInstance> {
    // console.log('AudioBufferInstrument', config, title);
    const {context} = this.destination;
    const startTime = context.currentTime;
    let createSourceNode = await configAudioBuffer();
    let createGain = configEnvelope(context, config);
    let filterNote = configFilterByKeyRange(config)

    const loadingTime = context.currentTime - startTime;
    if (loadingTime > 0) {
        this.currentTime += loadingTime // Move track time forward to compensate for loading time
        console.log("WebAudioFont preset loading time: ", loadingTime)
    }
    const instrumentInstance = function parseCommand(this: TrackState, commandState: CommandState) {
        const {command} = commandState;
        // TODO: check alias
        switch (command) {
            case 'play':
            case 'stop':
        }
        const noteInfo = parseNote(command);
        if (!noteInfo)
            throw new Error("Unrecognized note: " + command);
        if (filterNote(noteInfo, commandState))
            return
        return playAudioBuffer(noteInfo, commandState)
    }

    // Set instance to current instrument if no instrument is currently loaded
    if (this.instrument === defaultEmptyInstrument)
        this.instrument = instrumentInstance
    return instrumentInstance;


    function playAudioBuffer(noteInfo: ParsedNote, commandState: CommandState) {
        let {
            beatsPerMinute,
            currentTime,
            duration,
        } = commandState;

        // Envelope
        const gainNode = createGain(commandState);
        // Audio Buffer
        const bufferNode = createSourceNode(noteInfo, gainNode)

        bufferNode.start(currentTime);
        if (duration) {
            const endTime = currentTime + (duration * (60 / beatsPerMinute));
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
            audioBuffer = await getCachedAudioBuffer(context, src);
        } else {
            audioBuffer = src;
        }
        const parsedFrequencyRoot = getFrequencyRoot(frequencyRoot);
        return (noteInfo: ParsedNote, destination: AudioNode) => {
            const {frequency} = noteInfo;
            const bufferNode = context.createBufferSource();
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


async function getCachedAudioBuffer(context: BaseAudioContext, src: string): Promise<AudioBuffer> {
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


function getFrequencyRoot(frequencyRoot: number | string | null) {
    if (typeof frequencyRoot === "string") {
        const rootInfo = parseNote(frequencyRoot);
        if (!rootInfo)
            throw new Error("Invalid root frequency: " + frequencyRoot)
        return rootInfo.frequency;
    }
    return frequencyRoot || DEFAULT_FREQUENCY_ROOT;
}
