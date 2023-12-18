import {findTokenByType, findTokensByType, getTokenLength, ROOT_TRACK, sourceToTokens, tokensToKeys} from "./tokens";

import commands from "./commands";
import variables from "./variables";
import {TokenItem, TokenItemOrString, TokenList, TrackRange, TrackRanges} from "@songwalker/types";


// const DEFAULT_EXPORT_STATEMENT = `export default `;
const DEFAULT_EXPORT_STATEMENT = `module.exports=`;


export function compileSongToJavascript(
    songSource: string,
    eventMode: boolean = false,
    exportStatement: string = DEFAULT_EXPORT_STATEMENT) {
    const tokens = sourceToTokens(songSource)
    const trackTokenList = parseTrackList(tokens)
    const javascriptContent = compileTrackTokensToJavascript(tokens, trackTokenList, eventMode, exportStatement);
    return {javascriptContent, tokens, trackTokenList};
}


export function parseTrackList(tokens: TokenList): TrackRanges {
    let offsetStart = 0;
    let tokenStart = 0;
    let currentTrackName = ROOT_TRACK;
    const trackTokenList: TrackRanges = {}
    let pos = 0;
    for (let tokenID = 0; tokenID < tokens.length; tokenID++) {
        const token = tokens[tokenID];
        if (typeof token === 'string') {
        } else {
            switch (token.type) {
                case 'track-start':
                    const trackName = findTokenByType(token.content as TokenList, /^track-start-name$/).content as string;
                    // const match = formatTokenContent(token).match(REGEXP_FUNCTION_CALL);
                    trackTokenList[currentTrackName] = {
                        offsetStart,
                        offsetEnd: pos,
                        tokenStart,
                        tokenEnd: tokenID
                    }
                    currentTrackName = trackName;
                    offsetStart = pos + getTokenLength(token);
                    tokenStart = tokenID + 1;
                    break;
            }
        }
        pos += getTokenLength(token);
    }
    trackTokenList[currentTrackName] = {
        offsetStart,
        offsetEnd: pos,
        tokenStart,
        tokenEnd: tokens.length
    }
    console.log('trackTokenList', trackTokenList)
    return trackTokenList
}

export function compileTrackTokensToJavascript(
    tokenList: TokenList,
    tokenTrackList: TrackRanges,
    eventMode: boolean = false,
    exportStatement: string = DEFAULT_EXPORT_STATEMENT) {
    const javascriptContent = `${exportStatement}${Object.keys(tokenTrackList).map((trackName) =>
        formatTrack(trackName, tokenTrackList[trackName], tokenList, eventMode)
    ).join('\n\n')}`;
    console.log(javascriptContent)
    return javascriptContent;
}


function formatTrack(trackName: string, tokenRange: TrackRange, tokenList: TokenList, eventMode: boolean) {
    const functionNames: { [key: string]: boolean } = {};
    let debugWrapper = (s: string, t: number) => s + '';
    if (eventMode) {
        debugWrapper = (commandString: string, tokenID: number) => `${commands.setCurrentToken}(${tokenID});${commandString}`
        functionNames[commands.setCurrentToken] = true;
    }
    const partialTokenList = tokenList.slice(tokenRange.tokenStart, tokenRange.tokenEnd);
    let currenTokenID = tokenRange.tokenStart - 1;
    const functionContent = partialTokenList
        .map((token) => {
            currenTokenID++;
            if (typeof token === "string")
                return token;
            return `\t${formatTokenContent(token)};`;
        })
        .join('');
    const functionNameList = Object.values(functionNames).length > 0
        ? `${Object.keys(functionNames).join(', ')}`
        : '';
    return `async function ${trackName}(${variables.trackRenderer}) {
\tconst {${functionNameList}} = ${variables.trackRenderer};
${functionContent}
}`

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

                switch (functionNameString) {
                    case 'loadInstrument':
                        const firstParamToken = findTokenByType(functionTokenList, /^param-/);
                        if (firstParamToken.type === 'param-string') {
                            const pos = functionTokenList.indexOf(firstParamToken);
                            functionTokenList.splice(pos, 1, `require(${firstParamToken.content})`)
                        }
                }
                functionNames[functionNameString] = true;
                if (functionAssignResultToVariableToken) {
                    const functionTokenPos = functionTokenList.indexOf(functionNameToken);
                    const functionParamString = functionTokenList.slice(functionTokenPos)
                        .filter(token => typeof token === "string" || token.content !== ';')
                        .map((token) => formatTokenContent(token))
                        .join('');
                    functionNames[commands.setVariable] = true;
                    return `${commands.setVariable}('${functionAssignResultToVariableToken.content}', ${functionParamString})`;
                } else {
                    return functionTokenList.map((token) => formatTokenContent(token)).join('')
                }
            case 'variable-statement':
                const variableTokenList = [...token.content as TokenList];
                const variableNameToken = findTokenByType(variableTokenList, /^assign-to-variable$/);
                const variableValueToken = findTokenByType(variableTokenList, /^param-/);
                functionNames[commands.setVariable] = true;
                return `${commands.setVariable}('${variableNameToken.content}', ${formatTokenContent(variableValueToken)})`;
            case 'track-start':
                throw new Error("Shouldn't happen");
            case 'play-statement':
                const frequencyToken = findTokenByType(token.content as TokenList, /^play-frequency$/);
                const noteArgs = findTokensByType(token.content as TokenList, /^play-arg$/);
                functionNames[commands.playFrequency] = true;
                return debugWrapper(`${commands.playFrequency}('${frequencyToken.content}'${noteArgs.length === 0 ? ''
                    : ', ' + noteArgs.map(t => formatTokenContent(t)).join(', ')})`, currenTokenID);
            case 'play-arg':
                const playArgParamToken = findTokenByType(token.content as TokenList, /^param-/);
                return formatTokenContent(playArgParamToken);
            case 'play-track-statement':
                const trackNameToken = findTokenByType(token.content as TokenList, /^play-track-name$/);
                functionNames[commands.startTrack] = true;
                return debugWrapper(`${commands.startTrack}(${trackNameToken.content})`, currenTokenID);
            case 'wait-statement':
                const waitValues = tokensToKeys(token.content as TokenList);
                let numericString = formatNumericString(waitValues['param-numeric'], waitValues['param-factor']);
                functionNames[commands.wait] = true;
                return debugWrapper(`await ${commands.wait}(${numericString})`, currenTokenID);
            default:
            case 'unknown':
                throw new Error(`Unknown token type: ${JSON.stringify(token)} at tokenID ${currenTokenID}`);

            // return token.content as string;
            // throw new Error(`Unknown token type: ${JSON.stringify(token)} at tokenID ${tokenID}`);
        }
    }

    function formatNumericString(numericString: string, factorString: string) {
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
        functionNames[commands.trackState] = true;
        return `${commands.trackState}.${token.content}`
    }

}