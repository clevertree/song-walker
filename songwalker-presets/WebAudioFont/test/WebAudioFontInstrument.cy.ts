// noinspection DuplicatedCode

import WebAudioFontInstrument from "@songwalker-presets/WebAudioFont/WebAudioFontInstrument";
import {TrackState} from "@songwalker";
import {getDefaultSongFunctions, getDefaultTrackState} from "@songwalker/helper/songHelper";

describe('WebAudioFontInstrument', () => {

    it('loads and plays', async () => {
        const context = new AudioContext();
        const track: TrackState = {
            ...getDefaultTrackState(context.destination),
            destination: context.destination,
        }
        track.instrument = await WebAudioFontInstrument(track, {
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

        const {wait, parseAndPlayCommand: play} = getDefaultSongFunctions();

        for (let i = 0; i < 4; i++) {
            play(track, 'C3^0.1@1/2')
            wait(track, 1 / 2)
            play(track, 'D#3^0.1@1/2')
            wait(track, 1 / 2)
        }
    })
})
