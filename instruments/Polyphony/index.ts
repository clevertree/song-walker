import {NoteHandler, PlayNoteEvent} from "@songwalker/walker";
import {InstrumentInstance, InstrumentPreset} from "@songwalker/types";
import {parseFrequencyString} from "@songwalker/note";
import InstrumentLibrary from "@/instruments";
import is from "@sindresorhus/is";
import undefined = is.undefined;


export interface PolyphonyInstrumentConfig<TConfig> {
    title: string,
    voices: Array<VoiceConfiguration<TConfig>>
}

export interface VoiceConfiguration<TConfig> {
    alias?: string
    keyRangeLow?: string,
    keyRangeHigh?: string,
    preset: InstrumentPreset<TConfig>
}

export type PolyphonyInstrumentPreset<TConfig> = InstrumentPreset<PolyphonyInstrumentConfig<TConfig>>

export default async function PolyphonyInstrument(config: PolyphonyInstrumentConfig<object>): Promise<InstrumentInstance> {
    console.log('PolyphonyInstrument', config, config.title);
    // let activePolyphonys = [];

    const aliases: { [key: string]: InstrumentInstance } = {}
    const voices: { keyRangeLow: number; keyRangeHigh: number; voiceInstance: InstrumentInstance; }[] = [];
    for (const voice of config.voices) {
        const [instrumentPath, voiceConfig] = voice.preset;
        const voiceLoader = InstrumentLibrary.getInstrumentLoader(instrumentPath)
        const voiceInstance = await voiceLoader(voiceConfig);
        if (voice.alias)
            aliases[voice.alias] = voiceInstance;
        voices.push({
            keyRangeLow: parseFrequency(voice.keyRangeLow),
            keyRangeHigh: parseFrequency(voice.keyRangeHigh),
            voiceInstance
        })
    }


    return function (noteEvent: PlayNoteEvent) {
        const noteHandlers: NoteHandler[] = [];
        let noteCount = 0;
        const noteHandler: NoteHandler = {
            onended: null,
            stop(when?: number) {
                for (const noteHandler of noteHandlers) noteHandler.stop(when);
            },
        }

        function playVoice(voiceInstance: InstrumentInstance) {
            const noteHandler = voiceInstance(noteEvent);
            noteHandlers.push(noteHandler)
            noteHandler.onended = (e) => {
                if (noteCount-- === 0) {
                    noteHandler.onended && noteHandler.onended(e)
                }
            }
        }

        if (aliases[noteEvent.value]) {
            const voiceInstance = aliases[noteEvent.value];
            playVoice(voiceInstance);
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
                    playVoice(voiceInstance);
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