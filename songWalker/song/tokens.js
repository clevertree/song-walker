const Prism = require("prismjs");
const ROOT_TRACK = 'rootTrack'
const LANGUAGE = {
    'group': {
        pattern: /@\w+/,
        inside: {
            identifier: /^@/,
            name: /\w+/
        }
    },
    'import': {
        pattern: /import\s+(\w+)\s+from\s+(['"][\w.\/]+['"]);?/,
        inside: Prism.languages.javascript
    },
    'function-call': {
        pattern: /([^\s()]+)(?:\(([^)]*)\));?/,
        inside: Prism.languages.javascript
    },
    'play-statement': {
        pattern: /([A-G][#qb]{0,2}\d)(:[^:;\s]*)*;?/,
        inside: {
            note: /[A-G][#qb]{0,2}\d/,
            arg: /:[^:;\s]*/,
            punctuation: /;/
        }
    },
    'wait-statement': {
        pattern: /((\d[\/.])?\d{1,2})([BTDt])?;?/,
        inside: {
            numeric: /\d*[\/.]?\d+/,
            factor: /[BTDt]/,
            punctuation: /;/
        }
    },
    // 'newline': REGEXP_NEWLINE,
    // 'play-statement': REGEXP_PLAY_STATEMENT,
}
module.exports = {
    sourceToTokens,
    getTokenContentString,
    findTokenByType,
    findTokensByType,
    walkTokens,
    mapTokensToDOM,
    ROOT_TRACK,
    LANGUAGE,
}


function sourceToTokens(source) {
    return Prism.tokenize(source, LANGUAGE);
}

function getTokenContentString(token) {
    if (typeof token === "string")
        return token;
    if (Array.isArray(token.content))
        return token.content.map(token => getTokenContentString(token)).join('');
    return token.content;
}

function findTokenByType(tokenList, tokenType) {
    return walkTokens(tokenList, token => {
        if (typeof token !== "string" && token.type === tokenType) {
            return token;
        }
    })
}

function findTokensByType(tokenList, tokenType) {
    const foundTokenList = [];
    walkTokens(tokenList, token => {
        if (typeof token !== "string" && token.type === tokenType) {
            foundTokenList.push(token);
        }
    })
    return foundTokenList;
}


function walkTokens(tokenList, callback) {
    let returnValue;
    for (const token of tokenList) {
        returnValue = callback(token)
        if (returnValue)
            return returnValue;
        if (Array.isArray(token.content)) {
            returnValue = walkTokens(token.content)
            if (returnValue)
                return returnValue;
        } else {

        }
    }
    return false;
}

function mapTokensToDOM(tokenList, container, callback) {
    tokenList.map(token => {
        let element = callback(token);
        if (Array.isArray(token.content)) {
            mapTokensToDOM(token.content, element, callback)
        }
        container.appendChild(element)
    })
}