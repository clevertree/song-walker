// noinspection DuplicatedCode

import WebAudioFontInstrument from "@songwalker-presets/WebAudioFont/WebAudioFontInstrument";
import {parseCommandValues, TrackState} from "@songwalker";
import {defaultSongFunctions} from "@songwalker/helper/songHelper";
import instrumentKeys from './instrumentKeys.json'

describe('WebAudioFontInstrument', () => {

    it('loads and plays', async () => {
        const context = new AudioContext();
        const trackState: TrackState = {
            beatsPerMinute: 240,
            bufferDuration: 0,
            currentTime: 0,
            destination: context.destination,
            noteDuration: 0,
            noteVelocity: 0,
            velocityDivisor: 1,
            instrument: () => undefined
        }
        trackState.instrument = await WebAudioFontInstrument.bind(trackState)({
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
})
