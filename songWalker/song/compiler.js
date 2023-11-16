const Prism = require('prismjs');
const {
    ROOT_TRACK,
    sourceToTokens
} = require("./tokens.js");
const {getTokenContentString, findTokenByType, findTokensByType} = require("./tokens");
// const CMD_PRINT = '_';
const CMD_PLAY_NOTE = 'n';
const CMD_WAIT = 'w';

module.exports = {
    compiler,
    sourceToTokens
}

function compiler(source) {
    const imports = [];
    // console.log('source', source, Prism.languages.audioSource)
    let tokens = sourceToTokens(source);
    console.log('tokens', tokens)

    let currentGroup = ROOT_TRACK;
    const trackList = {[ROOT_TRACK]: {commands: [], functionNames: {}}}

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (typeof token === "string") {
            if (token.trim().length > 0)
                throw new Error(`Unrecognized token (${i}): ${token.trim()}`)
            trackList[currentGroup].commands.push(token);
            // trackList[currentGroup].commands.push(`${CMD_PRINT}(${formatArgString([token])});`);

        } else {
            switch (token.type) {
                case 'import':
                    // const [, importName, importPath] = token.content.match(REGEXP_IMPORT_STATEMENT);
                    // imports.push(`const ${importName} = require(${importPath});`)
                    imports.push(getTokenContentString(token));
                    break;
                case 'function-call':
                    const functionName = findTokenByType(token.content, 'function').content;
                    trackList[currentGroup].functionNames[functionName] = true;
                    trackList[currentGroup].commands.push(getTokenContentString(token));
                    // console.log('match', match)
                    break;
                case 'group':
                    const groupName = findTokenByType(token.content, 'name').content;
                    // const match = getTokenContentString(token).match(REGEXP_FUNCTION_CALL);
                    currentGroup = groupName;
                    trackList[currentGroup] = {commands: [], functionNames: {}}
                    // token.content = '';
                    break;
                case 'play-statement':
                    const noteString = findTokenByType(token.content, 'note').content;
                    const playArgs = findTokensByType(token.content, 'arg').map(token => token.content.substring(1));
                    // const [, noteString, playArgString] = getTokenContentString(token).match(REGEXP_PLAY_STATEMENT);
                    // const playArgs = playArgString ? playArgString.substring(1).split(':') : [];
                    trackList[currentGroup].commands.push(`${CMD_PLAY_NOTE}(${formatArgString([noteString, ...playArgs])});`);
                    trackList[currentGroup].functionNames[CMD_PLAY_NOTE] = true;
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
                    trackList[currentGroup].commands.push(`await ${CMD_WAIT}(${numericString});`);
                    trackList[currentGroup].functionNames[CMD_WAIT] = true;
                    break;
                default:
                    throw new Error("Unknown token type: " + token.type);
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
            return `async function ${trackName}({${functionNameList}}) {
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

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}


function parseArgString(argString) {
    if (matchDuration) {
        const [full, number, factorString] = matchDuration;
        switch (factorString) {
            default:
            case 'B':
                return number;
            case 'D':
                return `(${number})*1.5`
            case 'T':
                return `(${number})/1.5`
            case 't':
                return `(${number})/td()`
        }
    }
}
