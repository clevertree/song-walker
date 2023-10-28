const {isFrequencyString, isLengthString} = require("./note");
module.exports = function (source) {
    const imports = [], content = [], instruments = {};

    source = source.replace(/^import\s+(\w+)\s+from\s+(['"][\w.\/]+['"]);?/gm, function (full, importName, importPath) {
        // imports.push(`const ${importName} = require(${importPath});`)
        imports.push(full); //`import ${importName} from ${importPath};`)
        return '';
    })

    source = source.replace(/([^\s()]+)(?:\(([^)]+)\))?;?/gm, function (full, command, argString) {
        if (isFrequencyString(command)) {
            argString = argString ? parseArgString(argString) : '';
            return `n("${command}"${argString ? ',' + argString : ''});`;

        } else if (/^(\d*\/?\d+)([BTDt])?$/.test(command)) {
            argString = parseArgString(command); // + (argString ? ',' + argString : '');
            return `await w(${argString});`;

        } else {
            return `${command}(${argString});`;
        }

    })

    const scriptContent = `${imports.join("\n")}
export default async function (track) {
    const {playNote: n, wait: w} = track;
${source.split("\n").join("\t\n")}
}`
    console.log('scriptContent', scriptContent)
    return scriptContent;
}

function parseArgString(argString) {
    return argString.replace(/(\d*\/?\d+)([BTDt])/g, function (full, number, factorString) {
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
    })
}

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

