// noinspection DuplicatedCode

import {parseCommandValues, TrackState} from "@songwalker";
import PresetLibrary from "../../../../presets/PresetLibrary";
import {getDefaultTrackState} from "@songwalker/helper/songHelper";

describe('Oscillator', () => {
    it('Oscillator with Reverb', async () => {

        const context = new AudioContext();
        const trackState: TrackState = {
            ...getDefaultTrackState(context.destination),
            destination: context.destination,
        }
        const oscPreset = await PresetLibrary.findPreset("Oscillator");
        await oscPreset.loader.bind(trackState)({...oscPreset.config, mixer: 1.1});
        const reverbPreset = await PresetLibrary.findPreset("Reverb");
        await reverbPreset.loader.bind(trackState)({...reverbPreset.config, reverse: 5});

        function wait(duration: number) {
            trackState.currentTime += (duration) * (60 / trackState.beatsPerMinute);
        }

        function playCommand(commandString: string) {
            const commandInfo = parseCommandValues(commandString);
            const command: string,
                params: CommandParams = {...trackState, ...commandInfo.params, command: commandInfo.command};
            trackState.effects.forEach(effect => effect.bind(trackState)(commandState));
            trackState.instrument.bind(trackState)(commandState)
        }

        for (let o = 2; o <= 6; o++) {
            for (let i = 0; i < 6; i++) {
                const note = String.fromCharCode(65 + i)
                playCommand(`${note}${o}^0.1@1/8`)
                wait(1 / 8)
            }
        }
    })
})
