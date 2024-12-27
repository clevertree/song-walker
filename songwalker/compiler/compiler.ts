import {
    CommandParamsAliases,
    ParsedParams,
    SongCallback,
    SongFunctions,
    TokenItem,
    TokenList,
    TrackState
} from "@songwalker/types";
import {parseCommand, parseCommandParams, parseWait} from "@songwalker/helper/commandHelper";
import Prism, {Token} from "prismjs";

const ROOT_TRACK = 'rootTrack';
const VAR_TRACK_STATE = 'track';
const F_WAIT = "_w";
const F_LOAD = "_lp";
const F_PLAY = "_p";
const F_EXPORT = `{${
    'wait' as keyof SongFunctions
}:${F_WAIT}, ${
    'play' as keyof SongFunctions
}:${F_PLAY}, ${
    'loadPreset' as keyof SongFunctions
}:${F_LOAD}}`
const JS_TRACK_SETUP = (tab = '\t') => ``
    + `\n${tab}${VAR_TRACK_STATE} = {...${VAR_TRACK_STATE}, ${
        'parentTrack' as keyof TrackState}:${VAR_TRACK_STATE}, ${
        'position' as keyof TrackState
    }:0}`
    // + `\n${tab}const ${F_WAIT} = ${F_WAIT}.bind(${VAR_TRACK_STATE});`
    // + `\n${tab}const ${F_PLAY} = ${F_PLAY}.bind(${VAR_TRACK_STATE});`
    + `\n${tab}`;
export const EXPORT_JS = {
    // songTemplate: (sourceCode: string) => `(() => {return ${sourceCode}})()`,
    songTemplate: (sourceCode: string) =>
        `(async function ${ROOT_TRACK}(track, ${F_EXPORT}) {${sourceCode}})`,

    command: (commandString: string, params: ParsedParams) => {
        const propStrings: string[] = Object.keys(params).map(
            (paramName) => `${paramName}:${params[paramName as keyof ParsedParams]}`)
        let paramString = Object.values(params).length > 0 ? `, {${propStrings.join(',')}}` : '';
        return `${F_PLAY}('${commandString}'${paramString});`
    },
    // variable: (variableName: string, variableContent: string) => `${variableName}=${variableContent}`,
    wait: (durationStatement: string) => `if(await ${F_WAIT}(${durationStatement}))return;`,
    trackDefinition: (functionDefinition: string) => `async ${(functionDefinition).replace(/^track/i, 'function')}`
        + JS_TRACK_SETUP('\t'),
    function: (functionStatement: string) => {
        const functionMatch = (functionStatement).match(LANGUAGE["function-statement"]);
        if (!functionMatch)
            throw new Error("Invalid function: " + functionStatement)
        const [, fsVarStatement = "", fsAwaitStatement = "", fsMethodName, fsParamString] = functionMatch;
        return `${fsVarStatement}${fsAwaitStatement}${fsMethodName}.bind(${VAR_TRACK_STATE})(${fsParamString});`
    }
}
export const PARAM_ALIAS: CommandParamsAliases = {
    '@': 'duration',
    '^': 'velocity'
};

export const LANGUAGE = {
    'comment': /(\/\/).*$/m,
    'track-definition': /(?=async\s+)?\b(track)\b\s*([$\w][$\w]+)(\((?:[^()]|\([^()]*\))*\))\s*{/,
    'function-definition': /(?=async\s+)?\bfunction\b\s*([$\w][$\w]+)(\((?:[^()]|\([^()]*\))*\))\s*{/,
    'function-statement': /\b((?:(?:const|let)[ \t]*)?[\w.]+[ \t]*=[ \t]*)?(await\s+)?\b([$\w][$\w]+)\(((?:[^()]|\([^()]*\))*)\);?/,
    // 'function-statement': /\b(function|track)[ \t]+([\w.]+)[ \t]*\(([^)]*)\)\s*{/,
    // 'function-statement': /\b(((const|let)[ \t]*)?[\w.]+[ \t]*=[ \t]*)?\w+\([^)]*\)[ \t]*;?/,
    'variable-statement': /((const|let)[ \t]*)?[\w.]+[ \t]*=[ \t]*([\w'.\/-]|\{[^{}]*})+[ \t]*;?/,
    'command-statement': /\b([a-zA-Z][^@^=;\s]*)((?:[@^][^@^=;\s;]+)*);?/,
    'wait-statement': /(\d*[\/.]?\d+);?/,
    // 'track-start': PATTERN_TRACK_START,
    // 'import': {
    //     pattern: /import\s+(\w+)\s+from\s+(['"][\w.\/]+['"]);?/,
    //     inside: Prism.languages.javascript
    // },
    // 'function-statement': {
    //     pattern: /\b([\w.]+[ \t]*=[ \t]*)?\w+\([^)]*\)[ \t]*;?/,
    //     inside: {
    //         "assign-to-variable": /^[\w.]+(?=[ \t]*=[ \t]*)/,
    //         // 'assign-operator': /=/,
    //         'function-name': /\b\w+(?=\()/,
    //         'param-key': {
    //             pattern: /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z0-9](?:(?!\s)[$\w0-9])*(?=\s*:)/m,
    //             lookbehind: true
    //         },
    //         'param-string': {
    //             pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    //             greedy: true
    //         },
    //         'param-variable': /\b[a-zA-Z_]\w*\b/,
    //         'param-duration': PATTERN_DURATION,
    //         // 'punctuation': /[{}[\];(),.:]/
    //     }
    // },
    //     inside: {
    //         command: /^[^@^\s]+/,
    //         param: {
    //             pattern: /([@^][^@^\s;]+)/,
    //             inside: {
    //                 symbol: /^[@^]/,
    //                 value: /[^@^\s;]+$/,
    //             }
    //         },
    //         // punctuation: /;/
    //     }
    // },
    //     inside: {
    //         duration: /\d*[\/.]?\d+/,
    //         // punctuation: /;/
    //     }
    // },
    // inside: {
    //     "assign-to-variable": /^((const|let)[ \t]*)?[\w.]+(?=[ \t]*=[ \t]*)/,
    //     'param-string': /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    // 'assign-value': /[^=;]+/,
    // }
    // },
    // 'play-track-statement': {
    //     pattern: /@\w+/,
    //     inside: {
    //         'play-track-identifier': /^@/,
    //         'play-track-name': /\w+/
    //     }
    // },
    // 'play-statement': {
    //     pattern: /\b[a-zA-Z]\w*(:[^:;\s]*)*;?/,
    //     inside: {
    //         'play-note': /^[a-zA-Z]\w*/,
    //         'play-arg': {
    //             pattern: /:[^:;\s]*/,
    //             inside: {
    //                 'param-duration': {
    //                     pattern: /^:\d*[\/.]?\d{1,2}[BTDt]?$/,
    //                     inside: {
    //                         'param-numeric': /\d*[\/.]?\d+/,
    //                         'param-factor': /[BTDt]/,
    //                     }
    //                 },
    //                 'param-string': /[^:]+/,
    //             }
    //         },
    //         // punctuation: /;/
    //     },
    // },
    // 'token-unknown': /\S+/
    // punctuation: /;/
    // 'newline': REGEXP_NEWLINE,
    // 'play-statement': REGEXP_PLAY_STATEMENT,
}

function formatTokenContent(token: TokenItem | string, currentTokenID = 0): string {
    if (typeof token === "string")
        return token;
    switch (token[0]) {
        case 'name':
        case 'function-name':
        case 'punctuation':
        case 'param-numeric':
        case 'param-factor':
        case 'param-key':
        case 'param-variable':
        case 'param-string':
        case 'comment':
            return token[1] as string;
        case 'function-statement':
            return EXPORT_JS.function(token[1] as string);
        case 'variable-statement':
        case 'function-definition':
            return token[1] as string;
        case 'track-definition':
            return EXPORT_JS.trackDefinition(token[1] as string);
        // case 'param-duration':
        //     const durationValues = tokensToKeys(token[1] as TokenList);
        //     return formatNumericString(durationValues['param-numeric'], durationValues['param-factor']);
        case 'command-statement':
            const [commandString, paramString] = parseCommand(token[1] as string);
            const parsedParams = parseCommandParams(paramString);
            return EXPORT_JS.command(commandString, parsedParams);
        case 'wait-statement':
            return EXPORT_JS.wait(parseWait(token[1] as string));
        default:
        case 'unknown':
            throw new Error(`Unknown token type '${token[0]}': ${JSON.stringify(token)} at tokenID ${currentTokenID}`);
        // return formatVariableTokenContent(token);
        // return formatStringTokenContent(token);
        // case 'function-statement':
        //     const functionTokenList = [...token[1] as TokenList];
        //     const functionNameToken = findTokenByType(functionTokenList, /^function-name$/);
        //     const functionNameString = functionNameToken[1] as string;
        //     const functionAssignResultToVariableToken = findTokenByType(functionTokenList, /^assign-to-variable$/);
        //     let functionIsAwait = false;
        //
        //     switch (functionNameString) {
        //         case 'loadPreset':
        //         case 'loadInstrument':
        //             functionIsAwait = true;
        //         // const firstParamToken = findTokenByType(functionTokenList, /^param-/);
        //         // if (firstParamToken.type === 'param-string') {
        //         //     const pos = functionTokenList.indexOf(firstParamToken);
        //         //     functionTokenList.splice(pos, 1, `require(${firstParamToken[1]})`)
        //         // }
        //     }
        //     functionNames[functionNameString] = true;
        //     if (functionAssignResultToVariableToken) {
        //         const functionTokenPos = functionTokenList.indexOf(functionNameToken);
        //         const functionParamString = functionTokenList.slice(functionTokenPos)
        //             .filter(token => typeof token === "string" || token[1] !== ';')
        //             .map((token) => formatTokenContent(token))
        //             .join('');
        //         functionNames[COMMANDS.setVariable] = true;
        //         return `${COMMANDS.setVariable}('${functionAssignResultToVariableToken[1]}', ${functionIsAwait ? 'await ' : ''}${functionParamString})`;
        //     } else {
        //         return (functionIsAwait ? 'await ' : '') + functionTokenList.map((token) => formatTokenContent(token)).join('')
        //     }
        // case 'variable-statement':
        //     debugger;
        //     const variableName = getFirstTokenValue(token[1] as TokenList, 'assign-to-variable') as string;
        //     const variableValue = getFirstTokenValue(token[1] as TokenList, 'assign-value') as string;
        //     // const variableName = getFirstTokenValue(token[1] as TokenList, 'param-variable') as string;
        //     // const variableTokenList = [...token[1] as TokenList];
        //     // const variableNameToken = findTokenByType(variableTokenList, /^assign-to-variable$/);
        //     // const variableValueToken = findTokenByType(token[1] as TokenList, /^param-/);
        //     // functionNames[COMMANDS.setVariable] = true;
        //     return EXPORT_JS.variable(variableName, variableValue);
        // return `${COMMANDS.setVariable}('${variableNameToken[1]}', ${formatTokenContent(variableValueToken)})`;
        // case 'track-start':
        //     throw new Error("Shouldn't happen");
        // case 'play-arg':
        //     const playArgParamToken = findTokensByType(token[1] as TokenList, /^param-/);
        //     return playArgParamToken.length > 0 ? formatTokenContent(playArgParamToken[0]) : 'null';
        // case 'play-track-statement':
        //     const trackNameToken = findTokenByType(token[1] as TokenList, /^play-track-name$/);
        //     functionNames[COMMANDS.startTrack] = true;
        //     return `${COMMANDS.startTrack}(${trackNameToken[1]})`;

        // return token[1] as string;
        // throw new Error(`Unknown token type: ${JSON.stringify(token)} at tokenID ${tokenID}`);
    }
}

export function sourceToTokens(source: string, language: object = LANGUAGE): TokenList {
    function mapToken(token: string | Token): TokenItem | string {
        if (typeof token === "string") {
            return token;
        } else {
            let content = token.content as TokenList;
            if (Array.isArray(token.content)) {
                content = token.content.map(mapToken);
            }
            return [
                token.type,
                content
            ]
        }
    }

    return Prism.tokenize(source, language).map(mapToken);
}

export function tokensToSource(tokenList: TokenList): string {
    return tokenList.map(token => tokenToSource(token)).join('')
}

export function tokenToSource(token: TokenItem | string): string {
    if (typeof token === 'string') {
        return token;
    } else {
        if (Array.isArray(token[1])) {
            return tokensToSource(token[1]);
        } else {
            return token[1]
        }
    }
}

export function getTokenLength(token: TokenItem | string): number {
    if (typeof token === 'string') {
        return token.length;
    } else {
        if (Array.isArray(token[1])) {
            return token[1].reduce((sum, token) => sum + getTokenLength(token), 0);
        } else {
            return token[1].length
        }
    }
}


export function compileSongToJavascript(
    songSource: string,
    template: (s: string) => string = EXPORT_JS.songTemplate
    // eventMode: boolean = false
) {
    const tokenList = sourceToTokens(songSource)
    // const trackList = parseTrackList(songSource)
    // const javascriptContent = compileTrackTokensToJavascript(trackList, eventMode);
    // let currentTokenID = -1;
    const javascriptSource = tokenList
        .map((token, tokenID) => {
            // currentTokenID = tokenID;
            if (typeof token === "string")
                return token;
            return `${formatTokenContent(token, tokenID)}`;
        })
        // .map(debugMapper)
        .join('');
    return template(javascriptSource)
}


export function compileSongToCallback(songSource: string) {
    const jsSource = compileSongToJavascript(songSource);
    const callback: SongCallback = eval(jsSource);
    return callback;
}


// export function walkTokens(tokenList: TokenList, callback: (token: string | TokenItem) => boolean | undefined | void): boolean {
//     for (const token of tokenList) {
//         if (callback(token))
//             return true;
//         if (typeof token !== "string" && Array.isArray(token[1])) {
//             if (walkTokens(token[1], callback))
//                 return true;
//         }
//     }
//     return false;
// }

// function formatNumericString(numericString: string, factorString: string) {
//     if (numericString.startsWith('/') && numericString.length > 1)
//         numericString = `1${numericString}`;
//     switch (factorString) {
//         default:
//         case 'B':
//             return numericString;
//         case 'D':
//             return `(${numericString})*1.5`
//         case 'T':
//             return numericString = `(${numericString})/1.5`
//         case 't':
//             return numericString = `(${numericString})/td()`
//     }
// }

// function formatTrack(trackName: string, trackSource: string, eventMode: boolean) {
//     const tokenList = sourceToTokens(trackSource);
//     /** @deprecated **/
//     const functionNames: { [key: string]: boolean } = {};
//     let debugMapper = (s: string, t: number) => s + '';
//     if (eventMode) {
//         debugMapper = (commandString: string, tokenID: number) => {
//             if (commandString.trim() === '')
//                 return commandString;
//             return `${COMMANDS.setCurrentToken}(${tokenID});${commandString}`
//         }
//         functionNames[COMMANDS.setCurrentToken] = true;
//     }
//     let currentTokenID = -1;
//     const functionContent = tokenList
//         .map((token, tokenID) => {
//             currentTokenID = tokenID;
//             if (typeof token === "string")
//                 return token;
//             return `\t${formatTokenContent(token)};`;
//         })
//         .map(debugMapper)
//         .join('');
//     return `async function ${trackName}(${VARIABLES.trackRenderer}) {
// \tconst {${formatFunctionList()}} = ${VARIABLES.trackRenderer};
// ${functionContent}
// }`

// function formatFunctionList() {
//     if (Object.values(functionNames).length === 0)
//         return '';
//     return Object.keys(COMMANDS)
//         .filter(functionName => functionNames[COMMANDS[functionName]])
//         .map(functionName => {
//             const alias = COMMANDS[functionName];
//             if (alias === functionName)
//                 return functionName;
//             return `${functionName + ':' + alias}`
//         }).join(', ')
// }

// function formatStringTokenContent(token: TokenItem) {
//     // if (!/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/.test(token[1])) {
//     // return `'${token[1]}'`
//     // }
//     return token[1] as string;
// }
//
// function formatVariableTokenContent(token: TokenItem) {
//     // functionNames[COMMANDS.getTrackState] = true;
//     return `${VARIABLES.trackState}.${token[1]}`
// }


// export function parseTrackList(songSource: string): TrackSourceMap {
//     const LANGUAGE = {
//         'track-start': PATTERN_TRACK_START,
//     }
//     const tokens: TokenList = sourceToTokens(songSource, LANGUAGE);
//
//     let currentTrackName = ROOT_TRACK;
//     const trackList: TrackSourceMap = {}
//     let lastTrackSource = '';
//     for (let tokenID = 0; tokenID < tokens.length; tokenID++) {
//         const token = tokens[tokenID];
//         if (typeof token === 'string') {
//             lastTrackSource = token;
//         } else {
//             switch (token[0]) {
//                 case 'track-start':
//                     const trackName = findTokenByType(token[1] as TokenList, /^track-start-name$/).content as string;
//                     // const match = formatTokenContent(token).match(REGEXP_FUNCTION_CALL);
//                     trackList[currentTrackName] = lastTrackSource
//                     currentTrackName = trackName;
//                     break;
//             }
//         }
//     }
//     trackList[currentTrackName] = lastTrackSource
//     // console.log('parseTrackList', trackList)
//     return trackList
// }

// export function compileTrackTokensToJavascript(
//     trackList: TrackSourceMap,
//     eventMode: boolean = false) {
//     const javascriptContent = EXPORT_JS.songTemplate(`${Object.keys(trackList).map((trackName) =>
//         formatTrack(trackName, trackList[trackName], eventMode)
//     ).join('\n\n')}`);
//     console.log(javascriptContent)
//     return javascriptContent;
// }

