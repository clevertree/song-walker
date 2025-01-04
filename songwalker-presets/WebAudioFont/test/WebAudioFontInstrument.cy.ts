// noinspection DuplicatedCode

import WebAudioFontInstrument from "@songwalker-presets/WebAudioFont/WebAudioFontInstrument";
import {getDefaultSongWalkerState} from "@songwalker/helper/songHelper";

describe('WebAudioFontInstrument', () => {

    it('loads and plays', async () => {
        const context = new AudioContext();
        await context.suspend()
        const songState = getDefaultSongWalkerState(context);
        const {rootTrackState: track} = songState;
        track.beatsPerMinute = 160;
        track.instrument = await WebAudioFontInstrument(songState, {
            zones: [
                {
                    ahdsr: false,
                    // anchor: 0.00013605,
                    coarseTune: 0,
                    file: "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU3LjcyLjEwMQAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFMgDr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr//////////////////////////////////////////////////////////////////8AAAAATGF2YzU3Ljk2AAAAAAAAAAAAAAAAJAXoAAAAAAAABTKUt2u9AAAAAAD/++DEAAALjDds9BSALvRILT894DAIAV+1t4xjGMYxjAAAAAUE9ogCgIAgGGHxw8f+AAZ/h4e//AHeZ/+Bv/8wD/4Bn/8cAd+AGP/w8Ad/AMf/jwB38Rj//YA7/zf/+AAAAAAYeHh4eAAAAAIw8PDx4BDK0MqOQOgMqr7M1qNBoNQYBoAhgGgPBcAIwAwADGuKhMPwVAEgJAUBkOASEIARhikYmBoPKKAGmAYA6XuMAUBA01jfzTzpqGgBzBdAYRBMAQAkzqW6DYtFuMIAA8vUW6AwArhP0aHDQpntLqmPQa4KgAF72YrtZ2pUispsYa5t5jAFCmMAD0YU4O40AGVgAo/LLVn99lzPrFQoBqYNwJJgyh6GD+GAYA4ObZYAizrPJAs1KYzhVlJgJhNGCKDsYEIE5UBeMCEEYDAfwy4EATU5FJC/vzLsyq1EVaJxB4CAOmAIAmQABBQCu1NTEN3bMPyO1KpdnWpqb60qMAgB0tQSAMgQA9HBl8lVyFQDJXK6+FujllncYpKvK1Wlwq0tn6oJAET9C4DRgAgIIZjoCQJAITrYA3Jk2qSWWNVLFP3CX2+09PGa3ZTWprtamtarSrHALABl7VlCABUCAFpoDgB4IAHU0WDZC0FDJOZfP//////////////////63//z//f/v///////1/+IQDgSAIquMgGA0ARU6bi0mzqYsNaUIgCQYACvgYANBgAqwiL6VLeNejTWRGAIXuY2KgFKTEFNRTMuOTkuNaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMuOTkuNaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xDE1gPAAAGkHAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==",
                    fineTune: 0,
                    keyRangeHigh: 97,
                    keyRangeLow: 0,
                    loopEnd: 213,
                    loopStart: 188,
                    // midi: 31,
                    originalPitch: 8700,
                    sampleRate: 44100
                }
            ]
        })

        const {wait, execute} = songState;

        for (let i = 0; i < 4; i++) {
            execute(track, 'C3^10', {duration: 1 / 2})
            wait(track, 1 / 2)
            execute(track, 'D#3^10', {duration: 1 / 4})
            wait(track, 1 / 4)
            execute(track, 'E#3^10', {duration: 1 / 4})
            wait(track, 1 / 4)
        }
    })
})
