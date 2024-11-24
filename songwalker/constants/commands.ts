import {CommandParamsAliases} from "@songwalker/types";

export const commands: { [commandName: string]: string } = {
    loadInstrument: 'loadInstrument',
    loadPreset: 'loadPreset',
    playNote: 'playNote',
    setVariable: 'setVariable',
    setCurrentToken: '_',
    startTrack: 'startTrack',
    getTrackState: 'getTrackState',
    // require: 'require',
    wait: 'wait',
    // getVariable: 'getVariable'
    // setVariable: 'setVariable',
};

export const PARAM_ALIAS: CommandParamsAliases = {
    '@': 'noteDuration',
    '^': 'noteVelocity'
};

