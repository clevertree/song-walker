import {
    InstrumentInstance,
    InstrumentPreset,
    NoteHandler,
    ParsedCommandParams,
    TrackState
} from "@songwalker/types";


export interface PolyphonyInstrumentConfig<TConfig> {
    title?: string,
    voices: Array<VoiceConfiguration<TConfig>>
}

export interface VoiceConfiguration<TConfig> {
    alias?: string
    // keyRangeLow?: string,
    // keyRangeHigh?: string,
    preset: InstrumentPreset<TConfig>
}


export default async function PolyphonyInstrument(config: PolyphonyInstrumentConfig<any>): Promise<InstrumentInstance> {
    // console.log('PolyphonyInstrument', config, config.title);
    // let activePolyphonys = [];

    const aliases: { [key: string]: InstrumentInstance } = {}
    const voices: InstrumentInstance[] = [];
    await Promise.all(config.voices.map(voice => {
        const {instrument: voiceLoader, config: voiceConfig} = voice.preset;
        // const voiceLoader = InstrumentLibrary.getInstrumentLoader(instrumentPath)
        return new Promise<void>(async (resolve) => {
            const voiceInstance = await voiceLoader(voiceConfig);
            if (voice.alias)
                aliases[voice.alias] = voiceInstance;
            voices.push(voiceInstance)
            resolve();
        })
    }));


    return function playPolyphonyNote(noteCommand: string, trackState: TrackState, noteParams: ParsedCommandParams) {
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

        if (aliases[noteCommand]) {
            return aliases[noteCommand](noteCommand, trackState, noteParams);
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
                    const noteHandler = voiceInstance(trackState, command);
                    noteHandlers.push(noteHandler)
                }
            } else {
                throw new Error("Unrecognized note or frequency: " + noteEvent.value)
            }
        }
        return noteHandler;
    }


}
