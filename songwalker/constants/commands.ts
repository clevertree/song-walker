import {CommandParams, CommandParamsAliases, ParsedParams} from "@songwalker/types";
import {formatDuration} from "@songwalker/helper/commandHelper";

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
    trackWait: 'tw',
    // getVariable: 'getVariable'
    // setVariable: 'setVariable',
};

export const VARIABLES = {
    trackState: 'track',
}

export const EXPORT_JS = {
    songTemplate: (sourceCode: string) => `(() => {return ${sourceCode}})()`,

    instrument: (commandString: string, params: ParsedParams) => {
        const propStrings: string[] = Object.keys(params).map(
            (paramName) => `${paramName}:${params[paramName as keyof ParsedParams]}`)
        let paramString = Object.values(params).length > 0 ? `, {${propStrings.join(',')}}` : '';
        return `${VARIABLES.trackState}.instrument(${VARIABLES.trackState}, '${commandString}'${paramString})`
    },
    variable: (variableName: string, variableContent: string) => `${variableName}=${variableContent}`,
    wait: (durationStatement: string) => `await ${COMMMANDS.trackWait}(${formatDuration(durationStatement)})`,
    trackDefinition: (functionDefinition: string) => `async ${(functionDefinition).replace(/^track/i, 'function')}`
        + `const track = {...this};\n\tconst ${COMMMANDS.trackWait} = ${COMMMANDS.wait}.bind(track)\n\t`
}

export const PARAM_ALIAS: CommandParamsAliases = {
    '@': 'noteDuration',
    '^': 'noteVelocity'
};

