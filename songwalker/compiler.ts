import {
    findTokenByType,
    findTokensByType,
    PATTERN_TRACK_START,
    ROOT_TRACK,
    sourceToTokens,
    tokensToKeys
} from "./tokens";

import {COMMANDS, VARIABLES} from "./constants";
import {TokenItem, TokenItemOrString, TokenList, TrackSourceMap} from "@songwalker/types";
// import {getRequireCallback, InstrumentBank} from "@songwalker/walker";
// import Instruments from "../instruments/";

// const DEFAULT_EXPORT_STATEMENT = `export default `;
const DEFAULT_EXPORT_STATEMENT = `module.exports=`;


export function compileSongToCallback(songSource: string) { // instruments: InstrumentBank = Instruments
    const javascriptSource = compileSongToJavascript(songSource, true)

    // const require = getRequireCallback(instruments)
    const callback = eval(javascriptSource);

    // console.log('callback', callback)
    return callback;
}


export function compileSongToJavascript(
    songSource: string,
    eventMode: boolean = false,
    exportStatement: string = DEFAULT_EXPORT_STATEMENT) {
    // const tokens = sourceToTokens(songSource)
    const trackList = parseTrackList(songSource)
    const javascriptContent = compileTrackTokensToJavascript(trackList, eventMode, exportStatement);
    return javascriptContent;
}


export function parseTrackList(songSource: string): TrackSourceMap {
    const LANGUAGE = {
        'track-start': PATTERN_TRACK_START,
    }
    const tokens: TokenList = sourceToTokens(songSource, LANGUAGE);

    let currentTrackName = ROOT_TRACK;
    const trackList: TrackSourceMap = {}
    let lastTrackSource = '';
    for (let tokenID = 0; tokenID < tokens.length; tokenID++) {
        const token = tokens[tokenID];
        if (typeof token === 'string') {
            lastTrackSource = token;
        } else {
            switch (token.type) {
                case 'track-start':
                    const trackName = findTokenByType(token.content as TokenList, /^track-start-name$/).content as string;
                    // const match = formatTokenContent(token).match(REGEXP_FUNCTION_CALL);
                    trackList[currentTrackName] = lastTrackSource
                    currentTrackName = trackName;
                    break;
            }
        }
    }
    trackList[currentTrackName] = lastTrackSource
    // console.log('parseTrackList', trackList)
    return trackList
}

export function compileTrackTokensToJavascript(
    trackList: TrackSourceMap,
    eventMode: boolean = false,
    exportStatement: string = DEFAULT_EXPORT_STATEMENT) {
    const javascriptContent = `${exportStatement}${Object.keys(trackList).map((trackName) =>
        formatTrack(trackName, trackList[trackName], eventMode)
    ).join('\n\n')}`;
    // console.log(javascriptContent)
    return javascriptContent;
}

function formatTrack(trackName: string, trackSource: string, eventMode: boolean) {
    const tokenList = sourceToTokens(trackSource);
    const functionNames: { [key: string]: boolean } = {};
    let debugMapper = (s: string, t: number) => s + '';
    if (eventMode) {
        debugMapper = (commandString: string, tokenID: number) => {
            if (commandString.trim() === '')
                return commandString;
            return `${COMMANDS.setCurrentToken}(${tokenID});${commandString}`
        }
        functionNames[COMMANDS.setCurrentToken] = true;
    }
    let currentTokenID = -1;
    const functionContent = tokenList
        .map((token, tokenID) => {
            currentTokenID = tokenID;
            if (typeof token === "string")
                return token;
            return `\t${formatTokenContent(token)};`;
        })
        .map(debugMapper)
        .join('');
    return `async function ${trackName}(${VARIABLES.trackRenderer}) {
\tconst {${formatFunctionList()}} = ${VARIABLES.trackRenderer};
${functionContent}
}`

    function formatFunctionList() {
        if (Object.values(functionNames).length === 0)
            return '';
        return Object.keys(COMMANDS)
            .filter(functionName => functionNames[COMMANDS[functionName]])
            .map(functionName => {
                const alias = COMMANDS[functionName];
                if (alias === functionName)
                    return functionName;
                return `${functionName + ':' + alias}`
            }).join(', ')
    }

    function formatTokenContent(token: TokenItemOrString): string {
        if (typeof token === "string")
            return token;
        switch (token.type) {
            case 'name':
            case 'function-name':
            case 'punctuation':
            case 'param-numeric':
            case 'param-factor':
            case 'param-key':
                return token.content as string;
            case 'param-duration':
                const durationValues = tokensToKeys(token.content as TokenList);
                return formatNumericString(durationValues['param-numeric'], durationValues['param-factor']);
            case 'param-variable':
                return formatVariableTokenContent(token);
            case 'param-string':
                return formatStringTokenContent(token);
            case 'function-statement':
                const functionTokenList = [...token.content as TokenList];
                const functionNameToken = findTokenByType(functionTokenList, /^function-name$/);
                const functionNameString = functionNameToken.content as string;
                const functionAssignResultToVariableToken = findTokenByType(functionTokenList, /^assign-to-variable$/);
                let functionIsAwait = false;

                switch (functionNameString) {
                    case 'loadPreset':
                    case 'loadInstrument':
                        functionIsAwait = true;
                    // const firstParamToken = findTokenByType(functionTokenList, /^param-/);
                    // if (firstParamToken.type === 'param-string') {
                    //     const pos = functionTokenList.indexOf(firstParamToken);
                    //     functionTokenList.splice(pos, 1, `require(${firstParamToken.content})`)
                    // }
                }
                functionNames[functionNameString] = true;
                if (functionAssignResultToVariableToken) {
                    const functionTokenPos = functionTokenList.indexOf(functionNameToken);
                    const functionParamString = functionTokenList.slice(functionTokenPos)
                        .filter(token => typeof token === "string" || token.content !== ';')
                        .map((token) => formatTokenContent(token))
                        .join('');
                    functionNames[COMMANDS.setVariable] = true;
                    return `${COMMANDS.setVariable}('${functionAssignResultToVariableToken.content}', ${functionIsAwait ? 'await ' : ''}${functionParamString})`;
                } else {
                    return (functionIsAwait ? 'await ' : '') + functionTokenList.map((token) => formatTokenContent(token)).join('')
                }
            case 'variable-statement':
                const variableTokenList = [...token.content as TokenList];
                const variableNameToken = findTokenByType(variableTokenList, /^assign-to-variable$/);
                const variableValueToken = findTokenByType(variableTokenList, /^param-/);
                functionNames[COMMANDS.setVariable] = true;
                return `${COMMANDS.setVariable}('${variableNameToken.content}', ${formatTokenContent(variableValueToken)})`;
            case 'track-start':
                throw new Error("Shouldn't happen");
            case 'play-statement':
                const frequencyToken = findTokenByType(token.content as TokenList, /^play-note$/);
                const noteArgs = findTokensByType(token.content as TokenList, /^play-arg$/);
                functionNames[COMMANDS.playNote] = true;
                return `${COMMANDS.playNote}('${frequencyToken.content}'${noteArgs.length === 0 ? ''
                    : ', ' + noteArgs.map(t => formatTokenContent(t)).join(', ')})`;
            case 'play-arg':
                const playArgParamToken = findTokensByType(token.content as TokenList, /^param-/);
                return playArgParamToken.length > 0 ? formatTokenContent(playArgParamToken[0]) : 'null';
            case 'play-track-statement':
                const trackNameToken = findTokenByType(token.content as TokenList, /^play-track-name$/);
                functionNames[COMMANDS.startTrack] = true;
                return `${COMMANDS.startTrack}(${trackNameToken.content})`;
            case 'wait-statement':
                const waitValues = tokensToKeys(token.content as TokenList);
                let numericString = formatNumericString(waitValues['param-numeric'], waitValues['param-factor']);
                functionNames[COMMANDS.wait] = true;
                return `await ${COMMANDS.wait}(${numericString})`;
            default:
            case 'unknown':
                throw new Error(`Unknown token type: ${JSON.stringify(token)} at tokenID ${currentTokenID}`);

            // return token.content as string;
            // throw new Error(`Unknown token type: ${JSON.stringify(token)} at tokenID ${tokenID}`);
        }
    }

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

    function formatStringTokenContent(token: TokenItem) {
        // if (!/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/.test(token.content)) {
        // return `'${token.content}'`
        // }
        return token.content as string;
    }

    function formatVariableTokenContent(token: TokenItem) {
        functionNames[COMMANDS.trackState] = true;
        return `${COMMANDS.trackState}.${token.content}`
    }

}

