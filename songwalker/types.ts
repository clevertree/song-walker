export type TokenItem = {
    type: string,
    content: TokenList | string,
}

export type TokenItemOrString = TokenItem | string


export type TokenList = Array<TokenItemOrString>
export type TokenTrackList = {
    [key: string]: {
        tokens: TokenList,
        tokenStart: number,
        tokenEnd: number
    }
}
export type TokenRange = {
    name: string
    start: number,
    end: number,
}

export type TokenRangeTrackList = Array<TokenRange>