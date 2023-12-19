import {MenuState} from "./menu/menuActions";
import {ConfigObject} from "./config/configActions";

export type RootState = {
    menu: MenuState,
    document: DocumentState,

    config: ConfigObject
    // [key: string]: SourceEditorState | object,
}


export type DocumentState = {
    value: string,
    // isPlaying: boolean,
    isPlaying: boolean,
    // tokens: TokenList,
    // trackList: TrackRanges,
    activeEditors: {
        [trackName: string]: boolean
    },
    mode: 'track' | 'full'
}
