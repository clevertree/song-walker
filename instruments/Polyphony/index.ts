import {NoteHandler, PlayNoteEvent} from "@songwalker/walker";
import {InstrumentInstance, InstrumentPreset} from "@songwalker/types";
import {parseFrequencyString} from "@songwalker/note";
import InstrumentLibrary from "@/instruments";


export interface PolyphonyInstrumentConfig<TConfig> {
    title?: string,
    voices: Array<VoiceConfiguration<TConfig>>
}

export interface VoiceConfiguration<TConfig> {
    alias?: string
    keyRangeLow?: string,
    keyRangeHigh?: string,
    preset: InstrumentPreset<TConfig>
}


export default async function PolyphonyInstrument(config: PolyphonyInstrumentConfig<any>, context: BaseAudioContext): Promise<InstrumentInstance> {
    // console.log('PolyphonyInstrument', config, config.title);
    // let activePolyphonys = [];

    const aliases: { [key: string]: InstrumentInstance } = {}
    const voices: { keyRangeLow: number; keyRangeHigh: number; voiceInstance: InstrumentInstance; }[] = [];
    for (const voice of config.voices) {
        const {instrument: instrumentPath, config: voiceConfig} = voice.preset;
        const voiceLoader = InstrumentLibrary.getInstrumentLoader(instrumentPath)
        const voiceInstance = await voiceLoader(voiceConfig, context);
        if (voice.alias)
            aliases[voice.alias] = voiceInstance;
        voices.push({
            keyRangeLow: parseFrequency(voice.keyRangeLow),
            keyRangeHigh: parseFrequency(voice.keyRangeHigh),
            voiceInstance
        })
    }


    return function playPolyphonyNote(noteEvent: PlayNoteEvent) {
        const noteHandlers: NoteHandler[] = [];
        // let noteCount = 0;
        const noteHandler: NoteHandler = {
            addEventListener(type: string, listener: (evt: Event) => void, options?: boolean | AddEventListenerOptions) {
                for (const noteHandler of noteHandlers) noteHandler.addEventListener(type, listener, options);
            },
            stop(when?: number) {
                for (const noteHandler of noteHandlers) noteHandler.stop(when);
            },
        }


        if (aliases[noteEvent.value]) {
            return aliases[noteEvent.value](noteEvent);
            // if alias is found, execute directly
        } else {
            if (noteEvent.hasFrequency()) {
                const frequency = noteEvent.parseFrequency();
                for (let i = 0; i < voices.length; i++) {
                    const {keyRangeLow, keyRangeHigh, voiceInstance} = voices[i];
                    if (keyRangeLow && keyRangeLow > frequency) {
                        continue;
                    } else if (keyRangeHigh && keyRangeHigh < frequency) {
                        continue;
                    }
                    const noteHandler = voiceInstance(noteEvent);
                    noteHandlers.push(noteHandler)
                }
            } else {
                throw new Error("Unrecognized note or frequency: " + noteEvent.value)
            }
        }
        return noteHandler;
    }


}

function parseFrequency(frequencyValue: string | number | undefined): number {
    if (!frequencyValue)
        throw new Error("Invalid frequency value: " + typeof frequencyValue);
    if (typeof frequencyValue === "string")
        frequencyValue = parseFrequencyString(frequencyValue);
    return frequencyValue
}