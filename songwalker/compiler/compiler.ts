import {OverrideAliases, SongCallback, SongWalkerState} from "@songwalker/types";
import {formatCommandOverrides, parseWait} from "@songwalker/helper/commandHelper";
import Prism, {Token} from "prismjs";
import LANGUAGE from "@songwalker/compiler/language";


function formatTokenContent(token: Token | string, currentTokenID = 0): string {
    if (typeof token === "string")
        return token;
    switch (token.type as keyof typeof LANGUAGE) {
        case 'comment':
        case 'function-definition':
        case 'loop-statement':
        case 'function-statement':
            return token.content as string;
        // return exportFunctionStatement(token.content as string);
        case 'variable-statement':
            return (token.content as Array<Token | string>).map(formatTokenContent).join('')
        case 'track-statement':
            return exportTrackStatement(token.content as string);
        case 'track-definition':
            return exportTrackDefinition(token.content as string);
        case 'command-statement':
            return exportCommandStatement(token.content as string);
        case 'wait-statement':
            return exportWaitStatement(parseWait(token.content as string));
        default:
            throw new Error(`Unknown token type '${token.content}': ${JSON.stringify(token)} at tokenID ${currentTokenID}`);
    }
}

export function sourceToTokens(source: string) {
    return Prism.tokenize(source, LANGUAGE);
}

export function compileSongToJavascript(
    songSource: string,
    template: (s: string) => string = exportSongTemplate
    // eventMode: boolean = false
) {
    const tokenList = sourceToTokens(songSource)
    console.info((tokenList))
    const javascriptSource = tokenList
        .map((token, tokenID) => {
            if (typeof token === "string")
                return token;
            return `${formatTokenContent(token, tokenID)}`;
        })
        .join('');
    return template(javascriptSource)
}


export function compileSongToCallback(songSource: string) {
    const jsSource = compileSongToJavascript(songSource);
    console.info(jsSource)
    const callback: SongCallback = eval(jsSource);
    return callback;
}

export function songwalker(strings: TemplateStringsArray, ...values: string[]) {
    let result = '';
    strings.forEach((str, i) => {
        result += str + (values[i] ? values[i] : '');
    });
    return compileSongToCallback(result);
}

// export function getTokenLength(token: TokenItem | string): number {
//     if (typeof token === 'string') {
//         return token.length;
//     } else {
//         if (Array.isArray(token.content)) {
//             return token.content.reduce((sum, token) => sum + getTokenLength(token), 0);
//         } else {
//             return token.content.length
//         }
//     }
// }

/** Compiler Exports **/

const ROOT_TRACK = 'rootTrack';
const VAR_TRACK_STATE = 'track';
// export const F_WAIT = "_w";
// export const F_LOAD = "_lp";
// export const F_EXECUTE = "_e";
export const F_EXPORT = `{${
    'wait' as keyof SongWalkerState
}, ${
    'execute' as keyof SongWalkerState
}, ${
    'executeTrack' as keyof SongWalkerState
}, ${
    'loadPreset' as keyof SongWalkerState
}, ${
    'rootTrackState' as keyof SongWalkerState
}:track}`;
export const OVERRIDE_ALIAS: OverrideAliases = {
    '@': 'duration',
    '^': 'velocity'
};
export const TRACK_OVERRIDE_ALIAS: OverrideAliases = {
    '@': 'trackDuration',
    '^': 'velocity'
};

export function exportSongTemplate(sourceCode: string) {
    return `(async function ${ROOT_TRACK}(${F_EXPORT}) {\n${sourceCode}})`;
}

export function exportCommandStatement(commandString: string) {
    const match = (commandString).match(LANGUAGE["command-statement"]);
    if (!match)
        throw new Error("Invalid command statement: " + commandString)
    const [, command, overrideString] = match;
    const exportOverrides = overrideString ? ', ' + formatCommandOverrides(overrideString, OVERRIDE_ALIAS) : ''
    return `${'execute' as keyof SongWalkerState}(${VAR_TRACK_STATE}, "${command}"${exportOverrides});`
}

// variable: (variableName: string, variableContent: string) => `${variableName}=${variableContent}`,
export function exportWaitStatement(durationStatement: string) {
    return `if(await ${'wait' as keyof SongWalkerState}(${VAR_TRACK_STATE}${durationStatement ? ', ' + durationStatement : ''})) return;`;
}

export function exportTrackDefinition(trackDefinition: string) {
    const match = (trackDefinition).match(LANGUAGE["track-definition"]);
    if (!match)
        throw new Error("Invalid track definition: " + trackDefinition)
    const [, trackName, trackArgs] = match;
    return `async function ${trackName}(${VAR_TRACK_STATE}${trackArgs ? ', ' + trackArgs : ''}){`
}

export function exportTrackStatement(trackStatement: string) {
    const match = (trackStatement).match(LANGUAGE["track-statement"]);
    if (!match)
        throw new Error("Invalid track statement: " + trackStatement)
    const [, trackName, overrideString, paramString] = match;
    let exportOverrides = ', ' + formatCommandOverrides(overrideString, TRACK_OVERRIDE_ALIAS)
    // const functionCall = trackName + `.bind(${VAR_TRACK_STATE}${paramString ? ', ' + paramString : ''})`
    return `${'executeTrack' as keyof SongWalkerState}(${VAR_TRACK_STATE}, ${trackName}${exportOverrides}${paramString ? ', ' + paramString : ''});`
}
