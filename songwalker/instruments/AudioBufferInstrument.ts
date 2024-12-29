import {CommandWithParams, InstrumentInstance, ParsedNote, TrackState} from "@songwalker/types";
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

export default async function AudioBufferInstrument(track: TrackState, config: AudioBufferInstrumentConfig): Promise<InstrumentInstance> {
    // console.log('AudioBufferInstrument', config, title);
    const {context: audioContext} = track.destination;
    let createSourceNode = await configAudioBuffer();
    let createGain = configEnvelope(audioContext, config);
    let filterNote = configFilterByKeyRange(config)

    const syncTime = audioContext.currentTime - (track.currentTime + track.bufferDuration);
    if (syncTime > 0) {
        track.currentTime = audioContext.currentTime // Move track time forward to compensate for loading time
        console.error(`AudioBufferInstrument continued loading past buffer (${syncTime}). Syncing currentTime to `, track.currentTime)
    }
    const instrumentInstance = function parseCommand(track: TrackState, commandWithParams: CommandWithParams) {
        // TODO: check alias
        switch (commandWithParams.commandString) {
            case 'play':
            case 'stop':
                throw 'todo';
        }
        const noteInfo = parseNote(commandWithParams.commandString);
        if (!noteInfo)
            throw new Error("Unrecognized note: " + commandWithParams);
        if (filterNote(noteInfo))
            return
        return playAudioBuffer(noteInfo, {...track, ...commandWithParams})
    }

    // Set instance to current instrument if no instrument is currently loaded
    if (track.instrument === defaultEmptyInstrument)
        track.instrument = instrumentInstance
    return instrumentInstance;


    function playAudioBuffer(noteInfo: ParsedNote, trackAndParams: TrackState & CommandWithParams) {
        let {
            beatsPerMinute,
            startTime,
            duration,
        } = trackAndParams;

        // Envelope
        const gainNode = createGain(trackAndParams);
        // Audio Buffer
        const bufferNode = createSourceNode(noteInfo, gainNode)

        bufferNode.start(startTime);
        const endTime = startTime + (duration * (60 / beatsPerMinute));
        bufferNode.stop(endTime);
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
            audioBuffer = await getCachedAudioBuffer(audioContext, src);
        } else {
            audioBuffer = src;
        }
        const parsedFrequencyRoot = getFrequencyRoot(frequencyRoot);
        return (noteInfo: ParsedNote, destination: AudioNode) => {
            const {frequency} = noteInfo;
            const bufferNode = audioContext.createBufferSource();
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
    const response = await fetch(src, {signal: AbortSignal.timeout(5000)});
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
