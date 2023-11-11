const {isFrequencyString, isDurationString} = require("./note");
const Prism = require('prismjs');
const REGEXP_FUNCTION_CALL = /([^\s()]+)(?:\(([^)]+)\));?/;
const REGEXP_PLAY_STATEMENT = /([A-G][#qb]{0,2}\d?)((?::[^:;\s]+)+);?/;
const REGEXP_DURATION_STATEMENT = /(\d*[\/.]?\d+)([BTDt])?;?/;
const REGEXP_IMPORT_STATEMENT = /^import\s+(\w+)\s+from\s+(['"][\w.\/]+['"]);?/;
const REGEXP_GROUP_START = /@(\w+)/;
const ROOT_TRACK = 'rootTrack'
Prism.languages.audioSource = {
    'group': REGEXP_GROUP_START,
    'import': REGEXP_IMPORT_STATEMENT,
    'function-call': REGEXP_FUNCTION_CALL,
    'play-statement': REGEXP_PLAY_STATEMENT,
    'wait-statement': REGEXP_DURATION_STATEMENT
};

module.exports = convertToJavascript

function convertToJavascript(source) {
    const imports = [];
    // console.log('source', source, Prism.languages.audioSource)
    let tokens = Prism.tokenize(source, Prism.languages.audioSource);

    let currentGroup = ROOT_TRACK;
    const trackList = {[ROOT_TRACK]: {commands: [], functionNames: {}}}

    for (const token of tokens) {
        if (typeof token === "string") {
            trackList[currentGroup].commands.push(token);

        } else {
            switch (token.type) {
                case 'import':
                    // const [, importName, importPath] = token.content.match(REGEXP_IMPORT_STATEMENT);
                    // imports.push(`const ${importName} = require(${importPath});`)
                    imports.push(token.content);
                    break;
                case 'function-call':
                    const [fullFunctionCall, functionName, functionArgs] = token.content.match(REGEXP_FUNCTION_CALL);
                    console.log('function-call match', functionName, functionArgs, token)
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
                    const playArgs = playArgString ? playArgString.substring(1).split(':').map(a => parseArgString(a)) : [];
                    trackList[currentGroup].commands.push(`playNote('${noteString}'${playArgs.length > 0 ? ', ' + playArgs.join(', ') : ''});`);
                    trackList[currentGroup].functionNames.playNote = true;
                    break;
                case 'wait-statement':
                    const [, durationString, durationArgString] = token.content.match(REGEXP_DURATION_STATEMENT);
                    const durationArgs = durationArgString ? durationArgString.substring(1).split(':').map(a => parseArgString(a)) : [];
                    trackList[currentGroup].commands.push(`await wait(${parseArgString(durationString)}${durationArgs.length > 0 ? ', ' + durationArgs.join(', ') : ''});`);
                    trackList[currentGroup].functionNames.wait = true;
                    break;
                default:
                    throw new Error("Unknown token type: " + token.type);
            }
        }
    }
    console.log('groups', trackList)


    const scriptContent = `${imports.join("\n")}
export default ${Object.keys(trackList).map(trackName => {
            const {commands, functionNames} = trackList[trackName];
            const functionNameList = Object.values(functionNames).length > 0
                ? `{${Object.keys(functionNames).join(', ')}}`
                : '';
            return `async function ${trackName}(${functionNameList}) {
    ${commands.join('')}
}`
        }
    ).join('\n\n')}
`
    console.log('scriptContent', scriptContent)
    return scriptContent;
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

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

