const Prism = require('prismjs');
const {
    ROOT_TRACK,
    REGEXP_DURATION_STATEMENT,
    REGEXP_FUNCTION_CALL,
    REGEXP_GROUP_START,
    // REGEXP_IMPORT_STATEMENT,
    REGEXP_PLAY_STATEMENT,
    LANGUAGE
} = require("../lang/song");
const CMD_PRINT = '_';
const CMD_PLAY_NOTE = 'n';
const CMD_WAIT = 'w';

module.exports = compiler

function compiler(source) {
    const imports = [];
    // console.log('source', source, Prism.languages.audioSource)
    let tokens = Prism.tokenize(source, LANGUAGE);
    console.log('tokens', tokens)

    let currentGroup = ROOT_TRACK;
    const trackList = {[ROOT_TRACK]: {commands: [], functionNames: {}}}

    for (const token of tokens) {
        if (typeof token === "string") {
            if (token.trim().length > 0)
                throw new Error("Unrecognized token: " + token.trim())
            trackList[currentGroup].commands.push(token);
            // trackList[currentGroup].commands.push(`${CMD_PRINT}(${formatArgString([token])});`);

        } else {
            switch (token.type) {
                case 'import':
                    // const [, importName, importPath] = token.content.match(REGEXP_IMPORT_STATEMENT);
                    // imports.push(`const ${importName} = require(${importPath});`)
                    imports.push(token.content);
                    break;
                case 'function-call':
                    const [fullFunctionCall, functionName, functionArgs] = token.content.match(REGEXP_FUNCTION_CALL);
                    trackList[currentGroup].functionNames[functionName] = true;
                    trackList[currentGroup].commands.push(fullFunctionCall);
                    // console.log('match', match)
                    break;
                case 'group':
                    const [, groupName] = token.content.match(REGEXP_GROUP_START);
                    // const match = token.content.match(REGEXP_FUNCTION_CALL);
                    currentGroup = groupName;
                    trackList[currentGroup] = {commands: [], functionNames: {}}
                    token.content = '';
                    break;
                case 'play-statement':
                    const [, noteString, playArgString] = token.content.match(REGEXP_PLAY_STATEMENT);
                    const playArgs = playArgString ? playArgString.substring(1).split(':') : [];
                    trackList[currentGroup].commands.push(`${CMD_PLAY_NOTE}(${formatArgString([noteString, ...playArgs])});`);
                    trackList[currentGroup].functionNames[CMD_PLAY_NOTE] = true;
                    break;
                case 'wait-statement':
                    console.log(token.type, token.content)
                    trackList[currentGroup].commands.push(`await ${CMD_WAIT}(${formatArgString([token.content])});`);
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
                ? `, ${Object.keys(functionNames).join(', ')}`
                : '';
            return `async function ${trackName}({${CMD_PRINT}${functionNameList}}) {
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
    const matchDuration = argString.match(REGEXP_DURATION_STATEMENT);
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
