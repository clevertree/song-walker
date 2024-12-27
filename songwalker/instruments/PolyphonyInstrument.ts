import {CommandParams, InstrumentInstance, Preset, TrackState} from "@songwalker/types";
import {defaultEmptyInstrument} from "@songwalker/helper/songHelper";


export interface PolyphonyInstrumentConfig {
    title?: string,
    voices: Array<Preset<any>>
}

// export interface VoiceConfiguration {
//     alias?: string
//     preset: InstrumentPreset
// }


export default async function PolyphonyInstrument(track: TrackState, config: PolyphonyInstrumentConfig): Promise<InstrumentInstance> {
    // console.log('PolyphonyInstrument', config, config.title);

    let aliases: { [key: string]: InstrumentInstance } = {}
    const voices: InstrumentInstance[] = await Promise.all(config.voices.map(voice => {
        const {
            loader: voiceLoader,
            config: voiceConfig,
            title
        } = voice;
        // const voiceLoader = InstrumentLibrary.getInstrumentLoader(instrumentPath)
        return new Promise<InstrumentInstance>(async (resolve) => {
            const voiceInstance = await voiceLoader(track, voiceConfig);
            aliases[title] = voiceInstance;
            resolve(voiceInstance);
        })
    }));


    const instrumentInstance = function playPolyphonyNote(track: TrackState, command: string, params: CommandParams) {
        if (aliases[command]) {
            // if alias is found, execute directly
            return aliases[command](track, command, params);
        } else {
            for (let i = 0; i < voices.length; i++) {
                voices[i](track, command, params);
            }
        }
    }

    // Set instance to current instrument if no instrument is currently loaded
    if (track.instrument === defaultEmptyInstrument)
        track.instrument = instrumentInstance
    return instrumentInstance;
}
