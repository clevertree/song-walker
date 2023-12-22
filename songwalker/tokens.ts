import Prism, {Token} from "prismjs";
import {TokenItem, TokenItemOrString, TokenList} from "@songwalker/types";
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
export const LANGUAGE = {
    'track-start': PATTERN_TRACK_START,
    'play-track-statement': {
        pattern: /@\w+/,
        inside: {
            'play-track-identifier': /^@/,
            'play-track-name': /\w+/
        }
    },
    // 'import': {
    //     pattern: /import\s+(\w+)\s+from\s+(['"][\w.\/]+['"]);?/,
    //     inside: Prism.languages.javascript
    // },
    'function-statement': {
        pattern: /\b([\w.]+[ \t]*=[ \t]*)?\w+\([^)]*\)[ \t]*;?/,
        inside: {
            "assign-to-variable": /^[\w.]+(?=[ \t]*=[ \t]*)/,
            // 'assign-operator': /=/,
            'function-name': /\b\w+(?=\()/,
            'param-key': {
                pattern: /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,
                lookbehind: true
            },
            'param-string': {
                pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
                greedy: true
            },
            'param-variable': /\b[a-zA-Z_]\w*\b/,
            'param-duration': {
                pattern: /\d*[\/.]?\d{1,2}([BTDt])?/,
                inside: {
                    'param-numeric': /\d*[\/.]?\d+/,
                    'param-factor': /[BTDt]/,
                }
            },
            // 'punctuation': /[{}[\];(),.:]/
        }
    },
    'variable-statement': {
        pattern: /[\w.]+[ \t]*=[ \t]*([\w'./])+[ \t]*;?/,
        inside: {
            "assign-to-variable": /^[\w.]+(?=[ \t]*=[ \t]*)/,
            // 'assign-operator': /=/,
            // "javascript-statement": {
            //     pattern: /[\w'.]+/,
            //     inside: {
            'param-string': {
                pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
                greedy: true
            },

            'param-variable': /\b[a-zA-Z_]\w*\b/,
            'param-duration': {
                pattern: /\d*[\/.]?\d{1,2}([BTDt])?/,
                inside: {
                    'param-numeric': /\d*[\/.]?\d+/,
                    'param-factor': /[BTDt]/,
                }
            },
            // 'param-numeric': /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
            // 'punctuation': /[={}[\];(),.:]/
            //     }
            // },
            // punctuation: /;/
        }
    },
    'play-statement': {
        pattern: /([A-G][#qb]{0,2}\d)(:[^:;\s]*)*;?/,
        inside: {
            'play-frequency': /[A-G][#qb]{0,2}\d/,
            'play-arg': {
                pattern: /:[^:;\s]+/,
                inside: {
                    'param-duration': {
                        pattern: /\d*[\/.]?\d{1,2}([BTDt])?/,
                        inside: {
                            'param-numeric': /\d*[\/.]?\d+/,
                            'param-factor': /[BTDt]/,
                        }
                    },
                    'param-string': /[^:;]+/,
                    // delimiter: /:/
                },
            },
            // punctuation: /;/
        },
    },
    'wait-statement': {
        pattern: /\d*[\/.]?\d{1,2}([BTDt])?;?/,
        inside: {
            'param-numeric': /\d*[\/.]?\d+/,
            'param-factor': /[BTDt]/,
        }
    },
    'token-unknown': /\S+/
    // punctuation: /;/
    // 'newline': REGEXP_NEWLINE,
    // 'play-statement': REGEXP_PLAY_STATEMENT,
}


export function sourceToTokens(source: string, language: object = LANGUAGE): TokenList {
    function mapToken(token: string | Token): TokenItemOrString {
        if (typeof token === "string") {
            return token;
        } else {
            let content = token.content as TokenList;
            if (Array.isArray(token.content)) {
                content = token.content.map(mapToken);
            }
            return {
                type: token.type,
                content
            }
        }
    }

    return Prism.tokenize(source, language).map(mapToken);
}


export function findTokenByType(tokenList: TokenList, tokenType: RegExp): TokenItem {
    let foundToken = null;
    walkTokens(tokenList, token => {
        if (typeof token !== "string" && tokenType.test(token.type)) {
            foundToken = token;
            return true;
        }
    })
    if (!foundToken)
        throw new Error("Token type not found: " + tokenType);
    return foundToken;
}

export function findTokensByType(tokenList: TokenList, tokenType: RegExp) {
    const foundTokenList: TokenList = [];
    walkTokens(tokenList, (token: TokenItem | string) => {
        if (typeof token !== "string" && tokenType.test(token.type)) {
            foundTokenList.push(token);
        }
    })
    return foundTokenList;
}

export function tokensToKeys(tokenList: TokenList) {
    const keyValues: { [key: string]: any } = {}
    for (const token of tokenList) {
        if (typeof token !== 'string') {
            keyValues[token.type as string] = token.content;
        }
    }
    return keyValues;
}


export function walkTokens(tokenList: TokenList, callback: (token: string | TokenItem) => boolean | undefined | void): boolean {
    for (const token of tokenList) {
        if (callback(token))
            return true;
        if (typeof token !== "string" && Array.isArray(token.content)) {
            if (walkTokens(token.content, callback))
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
        if (Array.isArray(token.content)) {
            return tokensToSource(token.content);
        } else {
            return token.content
        }
    }
}

export function getTokenLength(token: TokenItem | string): number {
    if (typeof token === 'string') {
        return token.length;
    } else {
        if (Array.isArray(token.content)) {
            return token.content.reduce((sum, token) => sum + getTokenLength(token), 0);
        } else {
            return token.content.length
        }
    }
}