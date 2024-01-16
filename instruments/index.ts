import {InstrumentBank, InstrumentLoader} from "@songwalker/types";
import OscillatorInstrument from "@instruments/Oscillator";
import PolyphonyInstrument from "@instruments/Polyphony";
import AudioBufferInstrument from "@instruments/AudioBuffer";
import AudioBufferDynamicInstrument from "@instruments/AudioBuffer/Dynamic";

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
