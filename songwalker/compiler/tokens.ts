import Prism, {Token} from "prismjs";
import {TokenItem, TokenList} from "@songwalker/types";
// Prism.languages.javascript.constant = /\b[a-zA-Z](?:[a-zA-Z_]|\dx?)*\b/

export const ROOT_TRACK = 'rootTrack'

export const PATTERN_TRACK_START = {
    pattern: /\n?^\[[a-zA-Z]\w+]$\n?/m,
    lookbehind: true,
    // alias: 'selector',
    inside: {
        'track-start-name': /[a-zA-Z]\w+/,
        // punctuation: /[\[\]]/
    }
}
const PATTERN_DURATION = {
    pattern: /\d*[\/.]?\d{1,2};?/,
    inside: {
        'param-numeric': /\d*[\/.]?\d+/,
        'param-factor': /[BTDt]/,
    }
};
export const LANGUAGE = {
    // 'track-start': PATTERN_TRACK_START,
    // 'import': {
    //     pattern: /import\s+(\w+)\s+from\s+(['"][\w.\/]+['"]);?/,
    //     inside: Prism.languages.javascript
    // },
    // 'function-statement': {
    //     pattern: /\b([\w.]+[ \t]*=[ \t]*)?\w+\([^)]*\)[ \t]*;?/,
    //     inside: {
    //         "assign-to-variable": /^[\w.]+(?=[ \t]*=[ \t]*)/,
    //         // 'assign-operator': /=/,
    //         'function-name': /\b\w+(?=\()/,
    //         'param-key': {
    //             pattern: /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,
    //             lookbehind: true
    //         },
    //         'param-string': {
    //             pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    //             greedy: true
    //         },
    //         'param-variable': /\b[a-zA-Z_]\w*\b/,
    //         'param-duration': PATTERN_DURATION,
    //         // 'punctuation': /[{}[\];(),.:]/
    //     }
    // },
    'function-definition': /\b(function|track)[ \t]+([\w.]+)[ \t]*\(([^)]*)\)\s*{/,
    'function-statement': /\b(((const|let)[ \t]*)?[\w.]+[ \t]*=[ \t]*)?\w+\([^)]*\)[ \t]*;?/,
    'variable-statement': /((const|let)[ \t]*)?[\w.]+[ \t]*=[ \t]*([\w'./-])+[ \t]*;?/,
    // inside: {
    //     "assign-to-variable": /^((const|let)[ \t]*)?[\w.]+(?=[ \t]*=[ \t]*)/,
    //     'param-string': /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    // 'assign-value': /[^=;]+/,
    // }
    // },
    // 'play-track-statement': {
    //     pattern: /@\w+/,
    //     inside: {
    //         'play-track-identifier': /^@/,
    //         'play-track-name': /\w+/
    //     }
    // },
    // 'play-statement': {
    //     pattern: /\b[a-zA-Z]\w*(:[^:;\s]*)*;?/,
    //     inside: {
    //         'play-note': /^[a-zA-Z]\w*/,
    //         'play-arg': {
    //             pattern: /:[^:;\s]*/,
    //             inside: {
    //                 'param-duration': {
    //                     pattern: /^:\d*[\/.]?\d{1,2}[BTDt]?$/,
    //                     inside: {
    //                         'param-numeric': /\d*[\/.]?\d+/,
    //                         'param-factor': /[BTDt]/,
    //                     }
    //                 },
    //                 'param-string': /[^:]+/,
    //             }
    //         },
    //         // punctuation: /;/
    //     },
    // },
    'command-statement': {
        pattern: /\b([a-zA-Z][^@^\s]*)((?:[@^][^@^\s;]+)*);?/,
        inside: {
            command: /^[^@^\s]+/,
            param: {
                pattern: /([@^][^@^\s;]+)/,
                inside: {
                    symbol: /^[@^]/,
                    value: /[^@^\s;]+$/,
                }
            },
            // punctuation: /;/
        }
    },
    'wait-statement': {
        pattern: /\b\d*[\/.]?\d+;?/,
        inside: {
            duration: /\d*[\/.]?\d+/,
            // punctuation: /;/
        }
    },
    // 'token-unknown': /\S+/
    // punctuation: /;/
    // 'newline': REGEXP_NEWLINE,
    // 'play-statement': REGEXP_PLAY_STATEMENT,
}


export function sourceToTokens(source: string, language: object = LANGUAGE): TokenList {
    function mapToken(token: string | Token): TokenItem | string {
        if (typeof token === "string") {
            return token;
        } else {
            let content = token.content as TokenList;
            if (Array.isArray(token.content)) {
                content = token.content.map(mapToken);
            }
            return [
                token.type,
                content
            ]
        }
    }

    return Prism.tokenize(source, language).map(mapToken);
}

export function getFirstTokenValue(tokenList: TokenList, tokenType: string) {
    for (const token of tokenList) {
        if (typeof token === "string")
            continue;
        if (token[0] === tokenType)
            return token[1];
    }
    throw new Error("Token type not found: " + tokenType);
}

export function findTokenByType(tokenList: TokenList, tokenType: RegExp): TokenItem {
    let foundToken = null;
    walkTokens(tokenList, token => {
        if (typeof token !== "string" && tokenType.test(token[0])) {
            foundToken = token;
            return true;
        }
    })
    if (!foundToken) {
        debugger;
        throw new Error("Token type not found: " + tokenType);
    }
    return foundToken;
}

export function findTokensByType(tokenList: TokenList, tokenType: RegExp) {
    const foundTokenList: TokenList = [];
    walkTokens(tokenList, (token: TokenItem | string) => {
        if (typeof token !== "string" && tokenType.test(token[0])) {
            foundTokenList.push(token);
        }
    })
    return foundTokenList;
}

export function tokensToKeys(tokenList: TokenList) {
    const keyValues: { [key: string]: any } = {}
    for (const token of tokenList) {
        if (typeof token !== 'string') {
            keyValues[token[0] as string] = token[1];
        }
    }
    return keyValues;
}


export function walkTokens(tokenList: TokenList, callback: (token: string | TokenItem) => boolean | undefined | void): boolean {
    for (const token of tokenList) {
        if (callback(token))
            return true;
        if (typeof token !== "string" && Array.isArray(token[1])) {
            if (walkTokens(token[1], callback))
                return true;
        }
    }
    return false;
}

export function tokensToSource(tokenList: TokenList): string {
    return tokenList.map(token => tokenToSource(token)).join('')
}

export function tokenToSource(token: TokenItem | string): string {
    if (typeof token === 'string') {
        return token;
    } else {
        if (Array.isArray(token[1])) {
            return tokensToSource(token[1]);
        } else {
            return token[1]
        }
    }
}

export function getTokenLength(token: TokenItem | string): number {
    if (typeof token === 'string') {
        return token.length;
    } else {
        if (Array.isArray(token[1])) {
            return token[1].reduce((sum, token) => sum + getTokenLength(token), 0);
        } else {
            return token[1].length
        }
    }
}
