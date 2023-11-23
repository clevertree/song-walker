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
    compiler,
}

const DEFAULT_EXPORT_STATEMENT = `export default `;

function compiler(source, config = {}) {
    config = {
        eventMode: false,
        exportStatement: DEFAULT_EXPORT_STATEMENT,
        ...config
    };
    const imports = [];
    // console.log('source', source, Prism.languages.audioSource)
    const errors = [];
    let tokens = sourceToTokens(source);
    const trackList = parseTokenTracks(tokens, errors);
    console.log('tokens', tokens, trackList);

    const scriptContent = `${config.exportStatement}${Object.keys(trackList).map(trackName =>
        formatTrack(trackName, trackList[trackName].tokenList, trackList[trackName].functionNames, errors)
    ).join('\n\n')}`
    console.log(scriptContent)
    return [scriptContent, tokens, trackList, errors];
}

function parseTokenTracks(tokens) {
    let currentTrack = ROOT_TRACK;
    const trackList = {[ROOT_TRACK]: {tokenList: [], functionNames: {}}}
    for (let tokenID = 0; tokenID < tokens.length; tokenID++) {
        const token = tokens[tokenID];
        if (typeof token === "string") {
            trackList[currentTrack].tokenList.push(token);
        } else {
            switch (token.type) {
                case 'track-start':
                    const trackName = findTokenByType(token.content, 'name').content;
                    // const match = formatTokenContent(token).match(REGEXP_FUNCTION_CALL);
                    currentTrack = trackName;
                    trackList[currentTrack] = {tokenList: [], functionNames: {}}
                    // token.content = '';
                    break;
                default:
                    trackList[currentTrack].tokenList.push(token);
            }
        }
    }
    return trackList;
}

function formatTrack(trackName, tokenList, functionNames, errors = []) {
    const functionNameList = Object.values(functionNames).length > 0
        ? `${Object.keys(functionNames).join(', ')}`
        : '';
    return `async function ${trackName}(${variables.trackRenderer}) {
\tconst {${functionNameList}} = ${variables.trackRenderer};
${tokenList.map((token, tokenID) => formatTokenContent(token, tokenID)).join('')}
}`

    function formatTokenContent(token, tokenID) {
        if (typeof token === "string") {
            if (token.trim().length > 0) {
                errors.push(`Unrecognized token: ${token.trim()} at token ${tokenID}`)

            } else {
                return token;
            }
        }
        // if (Array.isArray(token.content))
        //     return token.content.map(token => formatTokenContent(token)).join('');

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

                functionNames[functionNameToken.content] = true;
                if (functionAssignResultToVariableToken) {
                    const functionTokenPos = functionTokenList.indexOf(functionNameToken);
                    return `${commands.setVariable}('${functionAssignResultToVariableToken.content}', ${functionTokenList.slice(functionTokenPos).map(token => formatTokenContent(token))}`;
                } else {
                    return formatTokenContent({
                        ...token,
                        content: functionTokenList
                    });
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
                return `${commands.playFrequency}('${frequencyToken.content}'${noteArgs.length === 0 ? '' : ', ' + noteArgs.map(t => formatTokenContent(t)).join(', ')})`;
            case 'play-track-statement':
                const trackNameToken = findTokenByType(token.content, 'name');
                functionNames[commands.startTrack] = true;
                return `${commands.startTrack}(${formatTokenContent(trackNameToken)})`;
            case 'wait-statement':
                let numericString = findTokenByType(token.content, 'numeric').content;
                const factorString = findTokenByType(token.content, 'factor').content;
                numericString = formatNumericString(numericString, factorString);
                functionNames[commands.wait] = true;
                return `await ${commands.wait}(${numericString})`;
            case 'punctuation':
                return token.content;
            default:
                throw new Error(`Unknown token type: ${JSON.stringify(token)} at tokenID ${tokenID}`);
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
        return `${variables.trackRenderer}.${token.content}`
    }
}
