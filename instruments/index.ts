import {InstrumentBank, InstrumentList, InstrumentLoader} from "@songwalker/types";
import OscillatorInstrument from "@/instruments/oscillator";

const instrumentList: InstrumentList = {
    'oscillator': OscillatorInstrument
}

const InstrumentLibrary: InstrumentBank = {
    getInstrumentLoader(instrumentPath: string): InstrumentLoader {
        const instrumentLoader = instrumentList[instrumentPath]
        if (!instrumentLoader)
            throw new Error("Instrument not found: " + instrumentPath);
        return instrumentLoader;
    }
}
export default InstrumentLibrary;
