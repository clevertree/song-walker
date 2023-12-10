import {MenuState} from "./menu/menuActions";
import {SourceEditorProps} from "./document/SourceEditor";
import {TokenList} from "@songwalker/types";

export type RootState = {
    menu: MenuState,
    document: DocumentState,
    // [key: string]: SourceEditorState | object,
}


export type DocumentState = {
    tokens: TokenList,
    activeEditors: SourceEditorProps[],
}
