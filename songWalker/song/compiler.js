const Prism = require('prismjs');
const {
    ROOT_TRACK,
    sourceToTokens
} = require("./tokens.js");
const {getTokenContentString, findTokenByType, findTokensByType} = require("./tokens");
const commands = require("./commands");
const variables = require("./variables");

module.exports = {
    compiler,
    sourceToTokens
}

function compiler(source) {
    const imports = [];
    // console.log('source', source, Prism.languages.audioSource)
    let tokens = sourceToTokens(source);
    console.log('tokens', tokens, findTokenByType(tokens, 'function-statement'))

    let currentTrack = ROOT_TRACK;
    const trackList = {[ROOT_TRACK]: {commands: [], functionNames: {}}}

    // let instrumentID = 0;
    let position = 0;
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        position += token.length;
        if (typeof token === "string") {
            if (token.trim().length > 0)
                throw new Error(`Unrecognized token (${i}): ${token.trim()} at position ${position}`)
            trackList[currentTrack].commands.push(token);
            // trackList[currentGroup].commands.push(`${CMD_PRINT}(${formatArgString([token])});`);
        } else {
            switch (token.type) {
                case 'import':
                    // const [, importName, importPath] = token.content.match(REGEXP_IMPORT_STATEMENT);
                    // imports.push(`const ${importName} = require(${importPath});`)
                    imports.push(getTokenContentString(token));
                    break;
                case 'function-statement':
                    const functionName = findTokenByType(token.content, 'function-name').content;
                    const functionAssignResultToVariableToken = findTokenByType(token.content, 'assign-to-variable');
                    if (functionAssignResultToVariableToken) {
                        functionAssignResultToVariableToken.content = `${variables.currentTrack}.${functionAssignResultToVariableToken.content}`
                        functionAssignResultToVariableToken.length = functionAssignResultToVariableToken.content.length;
                    }
                    // console.log('match', match)
                    switch (functionName) {
                        case 'loadInstrument':
                            const firstParamToken = findTokenByType(token.content, /^param-/);
                            if (firstParamToken.type === 'param-string') {
                                // const InstrumentIDVariable = `_Instrument${instrumentID++}`;
                                // imports.push(`import ${InstrumentIDVariable} from ${firstParamToken.content};`)
                                // firstParamToken.content = InstrumentIDVariable;
                                firstParamToken.content = `require(${firstParamToken.content})`
                                firstParamToken.length = firstParamToken.content.length;
                                firstParamToken.type = 'param-variable';
                            }
                            console.log(token.type, token)
                    }
                    trackList[currentTrack].functionNames[functionName] = true;
                    trackList[currentTrack].commands.push(getTokenContentString(token));
                    break;
                case 'variable-statement':
                    const variableNameToken = findTokenByType(token.content, 'assign-to-variable');
                    const variableValueToken = findTokenByType(token.content, /^param-/);
                    trackList[currentTrack].commands.push(`${variables.currentTrack}.${variableNameToken.content}=${formatArgTokens([variableValueToken])};`);
                    break;
                case 'track-start':
                    const trackName = findTokenByType(token.content, 'name').content;
                    // const match = getTokenContentString(token).match(REGEXP_FUNCTION_CALL);
                    currentTrack = trackName;
                    trackList[currentTrack] = {commands: [], functionNames: {}}
                    // token.content = '';
                    break;
                case 'play-statement':
                    const frequencyToken = findTokenByType(token.content, 'play-frequency');
                    const noteArgs = findTokensByType(token.content, /^param-/);
                    trackList[currentTrack].commands.push(`${commands.playNote}(${formatArgTokens([frequencyToken, ...noteArgs])});`);
                    trackList[currentTrack].functionNames[commands.playNote] = true;
                    break;
                case 'play-track-statement':
                    const trackNameToken = findTokenByType(token.content, 'name');
                    trackList[currentTrack].commands.push(`${commands.startTrack}(${formatArgTokens([trackNameToken])});`);
                    trackList[currentTrack].functionNames[commands.startTrack] = true;
                    break;
                case 'wait-statement':
                    let numericString = findTokenByType(token.content, 'numeric').content;
                    const factorString = findTokenByType(token.content, 'factor').content;
                    switch (factorString) {
                        default:
                        case 'B':
                            break;
                        case 'D':
                            numericString = `(${numericString})*1.5`
                            break;
                        case 'T':
                            numericString = `(${numericString})/1.5`
                            break;
                        case 't':
                            numericString = `(${numericString})/td()`
                            break;
                    }
                    trackList[currentTrack].commands.push(`await ${commands.wait}(${numericString});`);
                    trackList[currentTrack].functionNames[commands.wait] = true;
                    break;
                case 'punctuation':
                    trackList[currentTrack].commands.push(getTokenContentString(token));
                    break;
                default:
                    throw new Error(`Unknown token type: ${JSON.stringify(token)} at position ${position}`);
            }
        }
    }
    console.log('trackList', trackList)


    const scriptContent = `${imports.join("\n")}
export default ${Object.keys(trackList).map(trackName => {
            const {commands, functionNames} = trackList[trackName];
            const functionNameList = Object.values(functionNames).length > 0
                ? `${Object.keys(functionNames).join(', ')}`
                : '';
            return `async function ${trackName}(${variables.currentTrack}) {
const {${functionNameList}} = t;
${commands.join('')}
}`
        }
    ).join('\n\n')}
`
    console.log('scriptContent', scriptContent)
    return scriptContent;
}


function formatArgString(argString) {
    return argString
        .map(arg => isNumeric(arg) ? arg : `'${arg}'`)
        .join(', ')
}

function formatArgTokens(tokenList) {
    return tokenList
        .map(token => {
            switch (token.type) {
                case 'param-numeric':
                    return formatNumericToken(token);
                case 'param-variable':
                    return formatVariableToken(token);
                default:
                    return formatStringToken(token);
            }
        })
        .join(', ')
}

function formatNumericToken(token) {
    let [, numericString, factorString] = token.content.match(/(\d*[\/.]?\d{1,2})([BTDt])?/)
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

function formatStringToken(token) {
    if (!/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/.test(token.content)) {
        return `'${token.content}'`
    }
    return token.content;
}

function formatVariableToken(token) {
    return `${variables.currentTrack}.${token.content}`
}

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}


