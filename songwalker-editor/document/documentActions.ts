import {createSlice} from "@reduxjs/toolkit";
import {WritableDraft} from "immer/src/types/types-external";
import {ActiveEditor, DocumentState} from "@songwalker-editor/types";
import {TokenList, TokenRangeTrackList} from "@songwalker/types";
import {sourceToTokens} from "@songwalker/tokens";
import {parseTrackList} from "@songwalker/compiler";

const initialState: DocumentState = {
    tokens: [],
    trackList: {},
    activeEditors: []
}
export const documentActions = createSlice({
    name: 'documentSlice',
    initialState,
    reducers: {
        setEditorValue(
            state: WritableDraft<DocumentState>,
            action: {
                payload: {
                    tokens: TokenList,
                    trackList: TokenRangeTrackList,
                }
            }
        ) {
            state.tokens = action.payload.tokens;
            state.trackList = action.payload.trackList;
        },
        openActiveEditor(
            state: WritableDraft<DocumentState>,
            action: { payload: ActiveEditor }
        ) {
            if (state.activeEditors.find(editor => editor.trackName === action.payload.trackName)) {
                console.info("Active editor already open: " + action.payload.trackName)
            } else {
                state.activeEditors.push(action.payload);
            }
        },
    },
});

export function setEditorStringValue(sourceString: string) {
    const tokens = sourceToTokens(sourceString);
    const trackList = parseTrackList(tokens)
    return documentActions.actions.setEditorValue({
        tokens,
        trackList
    })
}

export function setEditorPartialStringValue(sourceString: string, fullTokens: TokenList, start: number, end: number) {
    const partialTokens = sourceToTokens(sourceString);
    const tokens = [...fullTokens];
    tokens.splice(start, end - start, ...partialTokens)
    const trackList = parseTrackList(tokens)
    return documentActions.actions.setEditorValue({
        tokens,
        trackList
    })
}


export const {
    openActiveEditor
    // setEditorValue,
    // setEditorPartialValue
} = documentActions.actions