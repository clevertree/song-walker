const Prism = require('prismjs');
const {
    ROOT_TRACK,
    sourceToTokens
} = require("./tokens.js");
const {
    formatTokenContent,
    findTokenByType,
    findTokensByType,
    formatNumericTokenContent,
    formatNumericString
} = require("./tokens");
const commands = require("./commands");
const variables = require("./variables");

module.exports = {
    compiler,
    sourceToTokens
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
    let tokens = sourceToTokens(source);
    console.log('tokens', tokens, findTokenByType(tokens, 'function-statement'))

    let currentTrack = ROOT_TRACK;
    const trackList = {[ROOT_TRACK]: {commandList: [], functionNames: {}}}
    const errors = [];

    for (let tokenID = 0; tokenID < tokens.length; tokenID++) {
        const token = tokens[tokenID];

        function addCommand(commandString, commandName, isPromise = false) {
            if (commandName)
                trackList[currentTrack].functionNames[commandName] = true;
            if (config.eventMode) {
                commandString = `${commands.triggerEvent}('${tokenID}', ${commandName}, ${commandString});`
                // isPromise = true
                trackList[currentTrack].functionNames[commands.triggerEvent] = true;
            }
            trackList[currentTrack].commandList.push("\t" + (isPromise ? 'await ' : '') + commandString + (/;[ \t]*$/.test(commandString) ? '' : ';'));
        }


        if (typeof token === "string") {
            if (token.trim().length > 0) {
                errors.push(`Unrecognized token: ${token.trim()} at token ${tokenID}`)

            } else {
                trackList[currentTrack].commandList.push(token.replace(/ +/g, ' ').replace(/\n+/g, '\n'));
            }
            // trackList[currentGroup].commandList.push(`${CMD_PRINT}(${formatArgString([token])})`);
        } else {
            switch (token.type) {
                // case 'import':
                //     // const [, importName, importPath] = token.content.match(REGEXP_IMPORT_STATEMENT);
                //     // imports.push(`const ${importName} = require(${importPath});`)
                //     imports.push(formatTokenContent(token));
                //     break;
                case 'function-statement':
                    const functionTokenList = [...token.content];
                    const functionNameToken = findTokenByType(token.content, 'function-name');
                    const functionAssignResultToVariableToken = findTokenByType(functionTokenList, 'assign-to-variable');

                    if (functionAssignResultToVariableToken) {
                        const functionTokenPos = functionTokenList.indexOf(functionNameToken);
                        addCommand(`${commands.setVariable}('${functionAssignResultToVariableToken.content}', ${formatTokenContent({
                            ...token,
                            content: functionTokenList.slice(functionTokenPos)
                        })})`, functionNameToken.content);
                    } else {
                        addCommand(formatTokenContent({
                            ...token,
                            content: functionTokenList
                        }), functionNameToken.content);
                    }
                    break;
                case 'variable-statement':
                    const variableNameToken = findTokenByType(token.content, 'assign-to-variable');
                    const variableValueToken = findTokenByType(token.content, /^param-/);
                    addCommand(`${commands.setVariable}('${variableNameToken.content}', ${formatTokenContent(variableValueToken)})`, commands.setVariable);
                    break;
                case 'track-start':
                    const trackName = findTokenByType(token.content, 'name').content;
                    // const match = formatTokenContent(token).match(REGEXP_FUNCTION_CALL);
                    currentTrack = trackName;
                    trackList[currentTrack] = {commandList: [], functionNames: {}}
                    // token.content = '';
                    break;
                case 'play-statement':
                    const frequencyToken = findTokenByType(token.content, 'play-frequency');
                    const noteArgs = findTokensByType(token.content, /^param-/);
                    addCommand(`${commands.playFrequency}('${frequencyToken.content}'${noteArgs.length === 0 ? '' : ', ' + noteArgs.map(t => formatTokenContent(t)).join(', ')})`, commands.playFrequency);
                    // trackList[currentTrack].functionNames[commands.playFrequency] = true;
                    break;
                case 'play-track-statement':
                    const trackNameToken = findTokenByType(token.content, 'name');
                    addCommand(`${commands.startTrack}(${formatTokenContent(trackNameToken)})`, commands.startTrack);
                    // trackList[currentTrack].functionNames[commands.startTrack] = true;
                    break;
                case 'wait-statement':
                    let numericString = findTokenByType(token.content, 'numeric').content;
                    const factorString = findTokenByType(token.content, 'factor').content;
                    numericString = formatNumericString(numericString, factorString);
                    addCommand(`${commands.wait}(${numericString})`, commands.wait, true);
                    // trackList[currentTrack].functionNames[commands.wait] = true;
                    break;
                case 'punctuation':
                    trackList[currentTrack].commandList.push(formatTokenContent(token));
                    break;
                default:
                    throw new Error(`Unknown token type: ${JSON.stringify(token)} at position ${position}`);
            }
        }
    }
    // console.log('trackList', trackList)


    const scriptContent = `${config.exportStatement}${Object.keys(trackList).map(trackName => {
            const {commandList, functionNames} = trackList[trackName];
            const functionNameList = Object.values(functionNames).length > 0
                ? `${Object.keys(functionNames).join(', ')}`
                : '';
            return `async function ${trackName}(${variables.currentTrack}) {
\tconst {${functionNameList}} = t;
${commandList.join('')}
}`
        }
    ).join('\n\n')}`
    console.log(scriptContent)
    return [scriptContent, tokens, trackList, errors];
}
