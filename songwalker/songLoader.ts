import {
    InstrumentInstance,
    InstrumentLoader,
    InstrumentPreset,
    TrackCallback,
    TrackRenderer,
    TrackState
} from "@songwalker/types";
import PresetLibrary from "@/samples";
import InstrumentLibrary from "./instruments/library";

export function loadSongAssets(
    songCallback: TrackCallback
) {
    // const audioContext = new AudioContext();
    const trackState = {
        // context: audioContext,
        // destination: audioContext.destination,
        // instrument: UnassignedInstrument,
    } as TrackState;
    loadTrackAssets(songCallback, trackState);
}


// TODO: track args
export function loadTrackAssets(
    trackCallback: TrackCallback,
    trackState: TrackState) {
    const trackRenderer: TrackRenderer = {
        trackState,
        async loadPreset(presetPath: string, config: object | undefined): Promise<InstrumentInstance> {
            const {
                instrument: instrumentPath,
                config: instrumentConfig
            }: InstrumentPreset = PresetLibrary.getPreset(presetPath)
            if (typeof config === "object")
                Object.assign(instrumentConfig, config);
            return trackRenderer.loadInstrument(instrumentPath, instrumentConfig);
        },
        async loadInstrument(instrumentPath: string | InstrumentLoader, config: object = {}): Promise<InstrumentInstance> {
            const instrumentLoader: InstrumentLoader = typeof instrumentPath === 'string' ? InstrumentLibrary.getInstrumentLoader(instrumentPath) : instrumentPath;
            trackState.instrument = await instrumentLoader(config);
            return trackState.instrument;
        },
        playNote(noteString: string, velocity?: number, duration?: number): void {
        },
        setVariable(variablePath: string, variableValue: any): void {
        },

        startTrack(trackCallback: TrackCallback): void {
            const subTrackState: TrackState = {
                ...trackState,
                position: 0,
            }
            loadTrackAssets(trackCallback, subTrackState)
        },
        async wait(duration: number): Promise<void> {
            trackState.position += duration;
        },
        setCurrentToken(tokenID: number) {
            trackState.currentTokenID = tokenID
        }
    }

    trackCallback(trackRenderer)
}

