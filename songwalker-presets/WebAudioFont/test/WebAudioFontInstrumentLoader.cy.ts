// noinspection DuplicatedCode

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
import {getDefaultSongWalkerState} from "@songwalker/helper/songHelper";

describe('WebAudioFontInstrument', () => {


    it('loads and plays instrument', async () => {
        let instrumentKeys = await fetchJSONFromMirror(PRESET_PATH_INSTRUMENT_KEYS);
        const context = new AudioContext();
        await context.suspend()

        const songState = getDefaultSongWalkerState(context);
        const {rootTrackState: track} = songState;
        track.instrument = await WebAudioFontInstrumentLoader(songState, {
            presetPath: `${PRESET_PATH_INSTRUMENT}/${instrumentKeys[Math.round(Math.random() * instrumentKeys.length)]}.json`
        })

        const {wait, parseAndExecute: play} = songState;

        for (let i = 0; i < 4; i++) {
            play(track, 'C3^10@1/2')
            wait(track, 1 / 2)
            play(track, 'D#3^10@1/2')
            wait(track, 1 / 2)
        }
    })

    it('loads and plays percussion', async () => {
        let percussionKeys = await fetchJSONFromMirror(PRESET_PATH_PERCUSSION_KEYS);
        const context = new AudioContext();
        await context.suspend()

        const songState = getDefaultSongWalkerState(context);
        const {rootTrackState: track} = songState;

        track.instrument = await WebAudioFontInstrumentLoader(songState, {
            presetPath: `${PRESET_PATH_PERCUSSION}/${percussionKeys[Math.round(Math.random() * percussionKeys.length)]}.json`
        })

        const {wait, parseAndExecute: play} = songState;

        for (let i = 0; i < 8; i++) {
            play(track, 'C3^10@1/2')
            wait(track, 1 / 4)
        }
    })

    it('loads and plays drumset', async () => {
        let drumsetKeys = await fetchJSONFromMirror(PRESET_PATH_DRUMSET_KEYS);

        const context = new AudioContext();
        await context.suspend()
        const songState = getDefaultSongWalkerState(context);
        const {rootTrackState: track} = songState;

        track.instrument = await WebAudioFontInstrumentLoader(songState, {
            presetPath: `${PRESET_PATH_DRUMSET}/${drumsetKeys[Math.round(Math.random() * drumsetKeys.length)]}.json`
        })

        const {wait, parseAndExecute: play} = songState;

        for (let o = 0; o <= 2; o++) {
            for (let i = 0; i < 6; i++) {
                const note = String.fromCharCode(65 + i)
                play(track, `${note}${o}^10@1/2`)
                wait(track, 1 / 4)
            }
        }
    })
})
