export type TokenItem = {
    type: string,
    content: TokenList | string,
}

export type TokenItemOrString = TokenItem | string


export type TokenList = Array<TokenItemOrString>

export type TokenRange = {
    tokens: TokenList,
    start: number,
    end: number,
}

export type TokenRangeTrackList = {
    [trackName: string]: TokenRange,
}