import {InstrumentBank, InstrumentLoader} from "../walker";
import OscillatorInstrument from "./oscillator";

const Instruments: InstrumentBank = {
    'oscillator': OscillatorInstrument
}
export default Instruments;

export function registerInstrument(instrumentName: string, instrumentLoader: InstrumentLoader) {
    Instruments[instrumentName] = instrumentLoader;
}

export function getInstrument(instrumentName: string) {
    const instrumentLoader = Instruments[instrumentName]
    if (!instrumentLoader)
        throw new Error("Instrument not found: " + instrumentName);
    return instrumentLoader;
}

