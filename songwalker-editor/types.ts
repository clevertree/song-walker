import {MenuState} from "./menu/menuActions";
import {TokenList, TokenRangeTrackList} from "@songwalker/types";

export type RootState = {
    menu: MenuState,
    document: DocumentState,
    // [key: string]: SourceEditorState | object,
}


export type DocumentState = {
    tokens: TokenList,
    trackList: TokenRangeTrackList,
    activeEditors: Array<ActiveEditor>,
}

export type ActiveEditor = {
    trackName: string,
    cursorPosition: number,
    mode: 'track' | 'full'
}