import {CommandWithOverrides, InstrumentLoader, ParsedNote, SongWalkerState, TrackState} from "@songwalker/types";
import {parseNote} from "..";
import {configEnvelope, EnvelopeConfig} from "./common/envelope";
import {configFilterByKeyRange, KeyRangeConfig} from "./common/filter";

const DEFAULT_FREQUENCY_ROOT = 220;


export interface AudioBufferInstrumentConfig extends EnvelopeConfig, KeyRangeConfig {
    title?: string,
    src: string | AudioBuffer,
    loop?: boolean,
    loopStart?: number,
    loopEnd?: number,
    pan?: number,
    detune?: number,
    frequencyRoot?: number | string
}

const AudioBufferInstrument: InstrumentLoader<AudioBufferInstrumentConfig> = async (songState: SongWalkerState, config) => {
    // console.log('AudioBufferInstrument', config, title);
    const {context: audioContext, rootTrackState, parseCommand} = songState;
    let createSourceNode = await configAudioBuffer();
    let createGain = configEnvelope(audioContext, config);
    let filterNote = configFilterByKeyRange(config)

    const syncTime = audioContext.currentTime - rootTrackState.currentTime;
    if (syncTime > 0) {
        // TODO: shouldn't happen
        console.error(`AudioBufferInstrument continued loading past buffer (${syncTime}).`)
    }
    return function (track: TrackState, command: string) {
        const parsedCommand = parseCommand(command);
        // TODO: check alias
        switch (parsedCommand.commandString) {
            case 'play':
            case 'stop':
                throw 'todo';
        }
        const noteInfo = parseNote(parsedCommand.commandString);
        if (!noteInfo)
            throw new Error("Unrecognized note: " + command);
        if (filterNote(noteInfo))
            return track
        return playAudioBuffer(noteInfo, track, parsedCommand)
    }

    function playAudioBuffer(noteInfo: ParsedNote, track: TrackState, command: CommandWithOverrides) {
        let {
            beatsPerMinute,
            currentTime,
            duration = 0,
            pan = 0
        } = {...config, ...track, ...command};

        // Envelope
        const gainNode = createGain(track, command);
        let destination = gainNode;

        // Panning
        if (pan) {
            const panNode = audioContext.createStereoPanner();
            panNode.pan.value = pan;
            panNode.connect(gainNode);
            destination = panNode;
        }

        // Audio Buffer
        const bufferNode = createSourceNode(noteInfo, destination)

        bufferNode.start(currentTime);
        const endTime = currentTime + (duration * (60 / beatsPerMinute));
        bufferNode.stop(endTime);
        // TODO: add active notes to track state?
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
export default AudioBufferInstrument;

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
