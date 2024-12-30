import {CommandWithParams, InstrumentInstance, Preset, TrackState} from "@songwalker/types";
import {defaultEmptyInstrument} from "@songwalker/helper/songHelper";


export interface PolyphonyInstrumentConfig {
    title?: string,
    voices: Array<Preset>
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


    const instrumentInstance = function playPolyphonyNote(track: TrackState, command: CommandWithParams) {
        if (aliases[command.commandString]) {
            // if alias is found, execute directly
            return aliases[command.commandString](track, command);
        } else {
            for (let i = 0; i < voices.length; i++) {
                voices[i](track, command);
            }
        }
    }

    // Set instance to current instrument if no instrument is currently loaded
    if (track.instrument === defaultEmptyInstrument)
        track.instrument = instrumentInstance
    return instrumentInstance;
}
