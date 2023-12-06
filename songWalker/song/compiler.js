const Prism = require('prismjs');
const {
    ROOT_TRACK,
    sourceToTokens,
    findTokenByType,
    findTokensByType,
} = require("./tokens");
const commands = require("./commands");
const variables = require("./variables");

module.exports = {
    compileSongToJavascript,
    compileTrackTokensToJavascript,
    sourceToTrackTokens,
}

// const DEFAULT_EXPORT_STATEMENT = `export default `;
const DEFAULT_EXPORT_STATEMENT = `module.exports=`;

function sourceToTrackTokens(source) {
    // const imports = [];
    // console.log('source', source, Prism.languages.audioSource)
    let tokenList = sourceToTokens(source);
    let currentTrack = ROOT_TRACK;
    const trackTokenList = {[ROOT_TRACK]: []}
    for (let tokenID = 0; tokenID < tokenList.length; tokenID++) {
        const token = tokenList[tokenID];
        if (typeof token === "string") {
            if (token.trim().length > 0) {
                trackTokenList[currentTrack].push({
                    type: 'unknown',
                    content: token,
                });
            } else {
                trackTokenList[currentTrack].push(token);
            }
        } else {
            token.tokenID = tokenID;
            switch (token.type) {
                case 'track-start':
                    const trackName = findTokenByType(token.content, 'name').content;
                    // const match = formatTokenContent(token).match(REGEXP_FUNCTION_CALL);
                    currentTrack = trackName;
                    trackTokenList[currentTrack] = [];
                    // token.content = '';
                    break;
                default:
                    trackTokenList[currentTrack].push(token);
            }
        }
    }
    return {tokenList, trackTokenList}
}

function compileTrackTokensToJavascript(trackTokenList, config = {}) {
    config = {
        eventMode: false,
        exportStatement: DEFAULT_EXPORT_STATEMENT,
        // requireStatement: DEFAULT_EXPORT_STATEMENT,
        ...config
    };
    const javascriptContent = `${config.exportStatement}${Object.keys(trackTokenList).map(trackName =>
        formatTrack(trackName, trackTokenList[trackName], config.eventMode)
    ).join('\n\n')}`
    // const callback = eval(scriptContent)
    console.log('compiler', javascriptContent, trackTokenList);
    return javascriptContent;
}


function compileSongToJavascript(songSource, config = {}) {

    const {tokens, trackTokenList} = sourceToTrackTokens(songSource)
    const javascriptContent = compileTrackTokensToJavascript(trackTokenList, config);
    return {javascriptContent, tokens, trackTokenList};
}


function formatTrack(trackName, tokenList, eventMode) {
    const functionNames = {};
    let debugWrapper = (s, t) => s + '';
    if (eventMode) {
        debugWrapper = (commandString, tokenID) => `${commands.setCurrentToken}(${tokenID});${commandString}`
        functionNames[commands.setCurrentToken] = true;
    }
    const functionContent = tokenList
        .map((token, tokenID) => {
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

    function formatTokenContent(token) {
        if (typeof token === "string")
            return token;
        switch (token.type) {
            case 'param-numeric':
                return formatNumericTokenContent(token);
            case 'param-variable':
                return formatVariableTokenContent(token);
            case 'param-string':
                return formatStringTokenContent(token);
            case 'function-statement':
                const functionTokenList = [...token.content];
                const functionNameToken = findTokenByType(token.content, 'function-name');
                const functionAssignResultToVariableToken = findTokenByType(functionTokenList, 'assign-to-variable');

                switch (functionNameToken.content) {
                    case 'loadInstrument':
                        const firstParamToken = findTokenByType(functionTokenList, /^param-/);
                        if (firstParamToken.type === 'param-string') {
                            const pos = functionTokenList.indexOf(firstParamToken);
                            functionTokenList.splice(pos, 1, `require(${firstParamToken.content})`)
                        }
                }
                functionNames[functionNameToken.content] = true;
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
                const variableNameToken = findTokenByType(token.content, 'assign-to-variable');
                const variableValueToken = findTokenByType(token.content, /^param-/);
                functionNames[commands.setVariable] = true;
                return `${commands.setVariable}('${variableNameToken.content}', ${formatTokenContent(variableValueToken)})`;
            case 'track-start':
                throw new Error("Shouldn't happen");
            case 'play-statement':
                const frequencyToken = findTokenByType(token.content, 'play-frequency');
                const noteArgs = findTokensByType(token.content, /^param-/);
                functionNames[commands.playFrequency] = true;
                return debugWrapper(`${commands.playFrequency}('${frequencyToken.content}'${noteArgs.length === 0 ? '' : ', ' + noteArgs.map(t => formatTokenContent(t)).join(', ')})`, token.tokenID);
            case 'play-track-statement':
                const trackNameToken = findTokenByType(token.content, 'name');
                functionNames[commands.startTrack] = true;
                return debugWrapper(`${commands.startTrack}(${formatTokenContent(trackNameToken)})`, token.tokenID);
            case 'wait-statement':
                let numericString = findTokenByType(token.content, 'numeric').content;
                const factorString = findTokenByType(token.content, 'factor').content;
                numericString = formatNumericString(numericString, factorString);
                functionNames[commands.wait] = true;
                return debugWrapper(`await ${commands.wait}(${numericString})`, token.tokenID);
            case 'unknown':
                throw new Error(`Unknown token type: ${JSON.stringify(token.content)} at tokenID ${token.tokenID}`);

            default:
                return token.content;
            // throw new Error(`Unknown token type: ${JSON.stringify(token)} at tokenID ${tokenID}`);
        }
    }

    function formatNumericTokenContent(token) {
        let [, numericString, factorString] = token.content.match(/(\d*[\/.]?\d{1,2})([BTDt])?/)
        return formatNumericString(numericString, factorString);
    }

    function formatNumericString(numericString, factorString) {
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

    function formatStringTokenContent(token) {
        if (!/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/.test(token.content)) {
            return `'${token.content}'`
        }
        return token.content;
    }

    function formatVariableTokenContent(token) {
        functionNames[commands.trackState] = true;
        return `${commands.trackState}.${token.content}`
    }

}