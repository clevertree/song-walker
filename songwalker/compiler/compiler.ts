import {
    findTokenByType,
    findTokensByType, getFirstTokenValue, LANGUAGE,
    PATTERN_TRACK_START,
    ROOT_TRACK,
    sourceToTokens,
    tokensToKeys, tokensToSource
} from "./tokens";

import {CommandParamsAliases, TokenItem, TokenList} from "@songwalker/types";
import {EXPORT_JS, PARAM_ALIAS, VARIABLES} from "../constants/commands";
import {parseCommandValues, parseNote} from "@songwalker";
import {parseCommand, parseCommandParams} from "@songwalker/helper/commandHelper";
// import {getRequireCallback, InstrumentBank} from "@songwalker/walker";
// import Instruments from "../instruments/";

// const DEFAULT_EXPORT_STATEMENT = `export default `;
// const DEFAULT_EXPORT_STATEMENT = `module.exports=`;

export function compileSongToCallback(songSource: string) { // instruments: InstrumentBank = Instruments
    const javascriptSource = compileSongToJavascript(songSource, true)

    // const require = getRequireCallback(instruments)
    const callback = eval(javascriptSource);

    // console.log('callback', callback)
    return callback;
}


export function compileSongToJavascript(
    songSource: string,
    eventMode: boolean = false) {
    const tokenList = sourceToTokens(songSource)
    // const trackList = parseTrackList(songSource)
    // const javascriptContent = compileTrackTokensToJavascript(trackList, eventMode);
    // let currentTokenID = -1;
    return tokenList
        .map((token, tokenID) => {
            // currentTokenID = tokenID;
            if (typeof token === "string")
                return token;
            return `${formatTokenContent(token, tokenID)}`;
        })
        // .map(debugMapper)
        .join('');
}


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
            const functionMatch = (token[1] as string).match(LANGUAGE["function-statement"]);
            if (!functionMatch)
                throw new Error("Invalid function: " + token[1])
            const [, fsVarStatement = "", fsAwaitStatement = "", fsMethodName, fsParamString] = functionMatch;
            return `${fsVarStatement}${fsAwaitStatement}${fsMethodName}.bind(${VARIABLES.trackState})(${fsParamString})`
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
            return EXPORT_JS.instrument(commandString, parsedParams);
        case 'wait-statement':
            return EXPORT_JS.wait(token[1] as string);
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
        default:
        case 'unknown':
            throw new Error(`Unknown token type '${token[0]}': ${JSON.stringify(token)} at tokenID ${currentTokenID}`);

        // return token[1] as string;
        // throw new Error(`Unknown token type: ${JSON.stringify(token)} at tokenID ${tokenID}`);
    }
}

/** @deprecated **/
function formatNumericString(numericString: string, factorString: string) {
    if (numericString.startsWith('/') && numericString.length > 1)
        numericString = `1${numericString}`;
    switch (factorString) {
        default:
        case 'B':
            return numericString;
        case 'D':
            return `(${numericString})*1.5`
        case 'T':
            return numericString = `(${numericString})/1.5`
        case 't':
            return numericString = `(${numericString})/td()`
    }
}

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


/** @deprecated **/
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

/** @deprecated **/
// export function compileTrackTokensToJavascript(
//     trackList: TrackSourceMap,
//     eventMode: boolean = false) {
//     const javascriptContent = EXPORT_JS.songTemplate(`${Object.keys(trackList).map((trackName) =>
//         formatTrack(trackName, trackList[trackName], eventMode)
//     ).join('\n\n')}`);
//     console.log(javascriptContent)
//     return javascriptContent;
// }

