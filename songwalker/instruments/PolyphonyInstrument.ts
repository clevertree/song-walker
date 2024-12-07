import {CommandState, InstrumentInstance, InstrumentPreset, TrackState} from "@songwalker/types";


export interface PolyphonyInstrumentConfig {
    title?: string,
    voices: Array<InstrumentPreset>
}

// export interface VoiceConfiguration {
//     alias?: string
//     preset: InstrumentPreset
// }


export default async function PolyphonyInstrument(this: TrackState, config: PolyphonyInstrumentConfig): Promise<InstrumentInstance> {
    // console.log('PolyphonyInstrument', config, config.title);

    let aliases: { [key: string]: InstrumentInstance } = {}
    const voices: InstrumentInstance[] = await Promise.all(config.voices.map(voice => {
        const {
            instrument: voiceLoader,
            config: voiceConfig,
            title
        } = voice;
        // const voiceLoader = InstrumentLibrary.getInstrumentLoader(instrumentPath)
        return new Promise<InstrumentInstance>(async (resolve) => {
            const voiceInstance = await voiceLoader.bind(this)(voiceConfig);
            aliases[title] = voiceInstance;
            resolve(voiceInstance);
        })
    }));


    return function playPolyphonyNote(this: TrackState, commandState: CommandState) {
        const {command} = commandState;
        if (aliases[command]) {
            // if alias is found, execute directly
            return aliases[command].bind(this)(commandState);
        } else {
            for (let i = 0; i < voices.length; i++) {
                voices[i].bind(this)(commandState);
            }
        }
    }
}
