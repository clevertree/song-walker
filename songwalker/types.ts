export type TokenItem = {
    type: string,
    content: TokenList | string,
}

export type TokenItemOrString = TokenItem | string


export type TokenList = Array<TokenItemOrString>

export type TrackRange = {
    // tokens: TokenList,
    offsetStart: number,
    offsetEnd: number,
    tokenStart: number,
    tokenEnd: number
}

export type TrackSourceMap = {
    [trackName: string]: string,
}