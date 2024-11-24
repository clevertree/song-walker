import {
    InstrumentInstance,
    InstrumentPreset,
    CommandParams,
    TrackState
} from "@songwalker/types";


export interface PolyphonyInstrumentConfig {
    title?: string,
    voices: Array<InstrumentPreset>
}

// export interface VoiceConfiguration {
//     alias?: string
//     preset: InstrumentPreset
// }


export default async function PolyphonyInstrument(config: PolyphonyInstrumentConfig): Promise<InstrumentInstance> {
    // console.log('PolyphonyInstrument', config, config.title);

    let aliases: { [key: string]: InstrumentInstance } = {}
    const voices: InstrumentInstance[] = await configVoices()

    async function configVoices() {
        aliases = {}
        return await Promise.all(config.voices.map(voice => {
            const {
                instrument: voiceLoader,
                config: voiceConfig,
                alias
            } = voice;
            // const voiceLoader = InstrumentLibrary.getInstrumentLoader(instrumentPath)
            return new Promise<InstrumentInstance>(async (resolve) => {
                const voiceInstance = await voiceLoader(voiceConfig);
                if (alias)
                    aliases[alias] = voiceInstance;
                resolve(voiceInstance);
            })
        }));
    }


    return function playPolyphonyNote(noteCommand: string, trackState: TrackState, noteParams: CommandParams) {
        if (aliases[noteCommand]) {
            // if alias is found, execute directly
            return aliases[noteCommand](noteCommand, trackState, noteParams);
        } else {
            for (let i = 0; i < voices.length; i++) {
                voices[i](noteCommand, trackState, noteParams);
            }
        }
    }
}
