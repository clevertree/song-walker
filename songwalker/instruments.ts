import {InstrumentLoader} from "./walker";


const registeredInstruments: { [key: string]: InstrumentLoader; } = {}

export function registerInstrument(instrumentName: string, instrumentLoader: InstrumentLoader) {
    registeredInstruments[instrumentName] = instrumentLoader;
}

export function getInstrument(instrumentName: string) {
    const instrumentLoader = registeredInstruments[instrumentName]
    if (!instrumentLoader)
        throw new Error("Instrument not found: " + instrumentName);
    return instrumentLoader;
}