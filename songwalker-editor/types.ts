import {TokenList, TokenRangeTrackList} from "@songwalker/types";
import {MenuState} from "./menu/menuActions";
import {ConfigObject} from "./config/configActions";

export type RootState = {
    menu: MenuState,
    document: DocumentState,
    config: ConfigObject
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