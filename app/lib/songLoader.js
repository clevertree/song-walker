const {isFrequencyString, isLengthString} = require("./note");
module.exports = function (source) {
    var matches = source.matchAll(/([^\s()]+)(?:\(([^)]+)\))?/gm);

    const imports = [], content = [], instruments = {};

    for (const match of matches) {
        const [full, command, argString] = match;
        const args = (argString || "").split(/,\s+/).filter(a => a)
        switch (command) {
            case 'i':
                const instrumentPath = args.shift();
                imports.push(`import Instrument from "${instrumentPath}"`)
                content.push(`i(Instrument${args.length > 0 ? ',' + exportArgs(args) : ''})`);
                break;
            case 'bpm':
                content.push(`bpm(${exportArgs(args)})`);
                break;
            default:
                if (isFrequencyString(command)) {
                    args.unshift(command)
                    content.push(`p(${exportArgs(args)})`);

                } else if (isLengthString(command)) {
                    args.unshift(command)
                    content.push(`await w(${exportArgs(args)})`);

                } else {
                    throw new Error("Unknown command: " + command);
                }

        }
    }
    const scriptContent = `${imports.join("\n")}\n\nexport default async ({p, i, w, bpm}) => {
    ${content.join("\n")}
    }`
    console.log('scriptContent', scriptContent)
    return scriptContent;
}

function exportArgs(args) {
    return args.map(arg => isNumeric(arg) ? arg : `"${arg}"`).join(",")
}

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

