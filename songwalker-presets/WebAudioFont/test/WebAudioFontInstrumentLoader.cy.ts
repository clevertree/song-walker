// noinspection DuplicatedCode

import {parseCommandValues, TrackState} from "@songwalker";
import WebAudioFontInstrumentLoader from "@songwalker-presets/WebAudioFont/WebAudioFontInstrumentLoader";
import {fetchJSONFromMirror} from "@songwalker-presets/WebAudioFont/mirrors";
import {
    PRESET_PATH_DRUMSET,
    PRESET_PATH_DRUMSET_KEYS,
    PRESET_PATH_INSTRUMENT,
    PRESET_PATH_INSTRUMENT_KEYS,
    PRESET_PATH_PERCUSSION,
    PRESET_PATH_PERCUSSION_KEYS
} from "@songwalker-presets/WebAudioFont/constants";

describe('WebAudioFontInstrument', () => {


    const defaultTrackState: TrackState = {
        beatsPerMinute: 240,
        bufferDuration: 0,
        currentTime: 0,
        noteDuration: 0,
        noteVelocity: 0,
        velocityDivisor: 1,
        destination: {} as AudioNode,
        effects: [],
        instrument: () => undefined
    }

    it('loads and plays instrument', async () => {
        let instrumentKeys = await fetchJSONFromMirror(PRESET_PATH_INSTRUMENT_KEYS);
        const context = new AudioContext();
        const trackState: TrackState = {
            ...defaultTrackState,
            destination: context.destination,
        }
        trackState.instrument = await WebAudioFontInstrumentLoader.bind(trackState)({
            presetPath: `${PRESET_PATH_INSTRUMENT}/${instrumentKeys[Math.round(Math.random() * instrumentKeys.length)]}.json`
        })

        function wait(duration: number) {
            trackState.currentTime += (duration) * (60 / trackState.beatsPerMinute);
        }

        function playCommand(commandString: string) {
            const commandInfo = parseCommandValues(commandString);
            trackState.instrument.bind(trackState)({...trackState, ...commandInfo.params, command: commandInfo.command})
        }

        for (let i = 0; i < 4; i++) {
            playCommand('C3^0.1@1/2')
            wait(1 / 2)
            playCommand('D#3^0.1@1/2')
            wait(1 / 2)
        }
    })

    it('loads and plays percussion', async () => {
        let percussionKeys = await fetchJSONFromMirror(PRESET_PATH_PERCUSSION_KEYS);
        const context = new AudioContext();
        const trackState: TrackState = {
            ...defaultTrackState,
            destination: context.destination,
        }
        trackState.instrument = await WebAudioFontInstrumentLoader.bind(trackState)({
            presetPath: `${PRESET_PATH_PERCUSSION}/${percussionKeys[Math.round(Math.random() * percussionKeys.length)]}.json`
        })

        function wait(duration: number) {
            trackState.currentTime += (duration) * (60 / trackState.beatsPerMinute);
        }

        function playCommand(commandString: string) {
            const commandInfo = parseCommandValues(commandString);
            trackState.instrument.bind(trackState)({...trackState, ...commandInfo.params, command: commandInfo.command})
        }

        for (let i = 0; i < 8; i++) {
            playCommand('C3^0.1@1/2')
            wait(1 / 4)
        }
    })

    it('loads and plays drumset', async () => {
        let drumsetKeys = await fetchJSONFromMirror(PRESET_PATH_DRUMSET_KEYS);
        const context = new AudioContext();
        const trackState: TrackState = {
            ...defaultTrackState,
            destination: context.destination,
        }
        trackState.instrument = await WebAudioFontInstrumentLoader.bind(trackState)({
            presetPath: `${PRESET_PATH_DRUMSET}/${drumsetKeys[Math.round(Math.random() * drumsetKeys.length)]}.json`
        })

        function wait(duration: number) {
            trackState.currentTime += (duration) * (60 / trackState.beatsPerMinute);
        }

        function playCommand(commandString: string) {
            const commandInfo = parseCommandValues(commandString);
            trackState.instrument.bind(trackState)({...trackState, ...commandInfo.params, command: commandInfo.command})
        }

        for (let o = 0; o <= 2; o++) {
            for (let i = 0; i < 6; i++) {
                const note = String.fromCharCode(65 + i)
                playCommand(`${note}${o}^0.1@1/2`)
                wait(1 / 4)
            }
        }
    })
})
