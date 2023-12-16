export type TokenItem = {
    type: string,
    content: TokenList | string,
}

export type TokenItemOrString = TokenItem | string


export type TokenList = Array<TokenItemOrString>

export type TrackRange = {
    // tokens: TokenList,
    start: number,
    end: number,
}

export type TrackRanges = {
    [trackName: string]: TrackRange,
}