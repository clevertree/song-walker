import {CommandParamsAliases} from "@songwalker/types";

export const COMMMANDS: { [commandName: string]: string } = {
    // loadInstrument: 'loadInstrument',
    // loadPreset: 'loadPreset',
    // playNote: 'playNote',
    // setVariable: 'setVariable',
    // setCurrentToken: '_',
    // startTrack: 'startTrack',
    // getTrackState: 'getTrackState',
    // require: 'require',
    wait: 'wait',
    // getVariable: 'getVariable'
    // setVariable: 'setVariable',
};

export const VARIABLES = {
    trackState: 'ts',
}

export const EXPORT_JS = {
    songTemplate: (sourceCode: string) => `(() => {return ${sourceCode}})()`,

    instrument: (...param: string[]) => VARIABLES.trackState + `.instrument(${VARIABLES.trackState}, ${param.join(', ')})`,
    variable: (variableName: string, variableContent: string) => VARIABLES.trackState + `.${variableName}=${variableContent}`,
    wait: (...param: string[]) => `await ${COMMMANDS.wait}(${VARIABLES.trackState}, ${param.join(', ')})`

}

export const PARAM_ALIAS: CommandParamsAliases = {
    '@': 'noteDuration',
    '^': 'noteVelocity'
};

