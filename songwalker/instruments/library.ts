import {InstrumentBank, InstrumentLoader} from "@songwalker/types";
import {
    AudioBufferDynamicInstrument,
    AudioBufferInstrument,
    OscillatorInstrument,
    PolyphonyInstrument
} from "@songwalker/instruments/index";

const instrumentList: { [instrumentName: string]: any } = {
    'Oscillator': OscillatorInstrument,
    'AudioBuffer': AudioBufferInstrument,
    'AudioBufferDynamic': AudioBufferDynamicInstrument,
    'Polyphony': PolyphonyInstrument
}

const InstrumentLibrary: InstrumentBank = {
    getInstrumentLoader(instrumentPath: string): InstrumentLoader {
        const instrumentLoader = instrumentList[instrumentPath] as InstrumentLoader
        if (!instrumentLoader)
            throw new Error("Instrument not found: " + instrumentPath);
        return instrumentLoader;
    }

}

export default InstrumentLibrary;

export function registerInstrument(instrumentName: string, instrumentLoader: InstrumentLoader) {
    instrumentList[instrumentName] = instrumentLoader;
}
