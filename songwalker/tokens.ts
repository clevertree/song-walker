import Prism from "prismjs";
import {TokenItem, TokenList, TokenRange, TokenRangeTrackList} from "@songwalker/types";
// Prism.languages.javascript.constant = /\b[a-zA-Z](?:[a-zA-Z_]|\dx?)*\b/

export const ROOT_TRACK = 'rootTrack'
export const LANGUAGE = {
    'track-start': {
        pattern: /\[[^\]]+]/m,
        lookbehind: true,
        alias: 'selector',
        inside: {
            name: /[^\[\]]+/,
            punctuation: /[\[\]]/
        }
    },
    'play-track-statement': {
        pattern: /@\w+/,
        inside: {
            identifier: /^@/,
            name: /\w+/
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
            'param-numeric': /\d*[\/.]?\d{1,2}([BTDt])?/,
            'operator': /=/,
            'punctuation': /[{}[\];(),.:]/
        }
    },
    'variable-statement': {
        pattern: /[\w.]+[ \t]*=[ \t]*([\w'./])+[ \t]*;?/,
        inside: {
            "assign-to-variable": /^[\w.]+(?=[ \t]*=[ \t]*)/,
            // "javascript-statement": {
            //     pattern: /[\w'.]+/,
            //     inside: {
            'param-string': {
                pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
                greedy: true
            },

            'param-variable': /\b[a-zA-Z_]\w*\b/,
            'param-numeric': /\d*[\/.]?\d{1,2}([BTDt])?/,
            // 'param-numeric': /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
            // 'punctuation': /[={}[\];(),.:]/
            //     }
            // },
            'operator': /=/,
            punctuation: /;/
        }
    },
    'play-statement': {
        pattern: /([A-G][#qb]{0,2}\d)(:[^:;\s]*)*;?/,
        inside: {
            'play-frequency': /[A-G][#qb]{0,2}\d/,
            arg: {
                pattern: /:[^:;\s]+/,
                inside: {
                    'param-numeric': /\d*[\/.]?\d{1,2}([BTDt])?/,
                    'param-string': /[^:;]+/,
                    delimiter: /:/
                },
            },
            punctuation: /;/
        },
    },
    'wait-statement': {
        pattern: /((\d[\/.])?\d{1,2})([BTDt])?;?/,
        inside: {
            numeric: /\d*[\/.]?\d+/,
            factor: /[BTDt]/,
            punctuation: /;/
            // punctuation: /;/
        }
    },
    punctuation: /;/
    // 'newline': REGEXP_NEWLINE,
    // 'play-statement': REGEXP_PLAY_STATEMENT,
}


export function sourceToTokens(source: string): TokenList {
    return Prism.tokenize(source, LANGUAGE) as TokenList;
}

export function parseTrackList(tokens: TokenList): TokenRangeTrackList {
    let currentTrack: TokenRange = {
        name: 'trackRoot',
        start: 0,
        end: -1
    };
    const trackTokenList: TokenRangeTrackList = [currentTrack]
    for (let tokenID = 0; tokenID < tokens.length; tokenID++) {
        const token = tokens[tokenID];
        if (typeof token === 'string') {

        } else {
            switch (token.type) {
                case 'track-start':
                    const trackName = findTokenByType(token.content as TokenList, /^name$/).content as string;
                    // const match = formatTokenContent(token).match(REGEXP_FUNCTION_CALL);
                    currentTrack.end = tokenID - 1;
                    currentTrack = {
                        name: trackName,
                        start: tokenID,
                        end: -1
                    };
                    trackTokenList.push(currentTrack)
                    // token.content = '';
                    break;
                // default:
                //     trackTokenList[currentTrack].tokens.push(token);
            }
        }
    }
    currentTrack.end = tokens.length - 1;
    return trackTokenList
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