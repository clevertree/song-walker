import {createSlice} from "@reduxjs/toolkit";
import {WritableDraft} from "immer/src/types/types-external";
import {ActiveEditor, DocumentState} from "@songwalker-editor/types";
import {TokenList, TokenRangeTrackList} from "@songwalker/types";
import {sourceToTokens} from "@songwalker/tokens";
import {parseTrackList} from "@songwalker/compiler";
import store from "../store";

const initialState: DocumentState = {
    tokens: [],
    trackList: {},
    activeEditors: []
}
export const documentActions = createSlice({
    name: 'documentSlice',
    initialState,
    reducers: {
        setDocumentValue(
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
        setActiveEditorPosition(
            state: WritableDraft<DocumentState>,
            action: {
                payload: {
                    trackName: string,
                    cursorPosition: number
                }
            }
        ) {
            const {trackName, cursorPosition} = action.payload;
            const activeEditor = state.activeEditors.find(editor => editor.trackName === trackName);
            if (!activeEditor)
                throw new Error("Active editor not found: " + trackName)
            activeEditor.cursorPosition = cursorPosition
        },
    },
});

export function setDocumentStringValue(sourceString: string) {
    const tokens = sourceToTokens(sourceString);
    const trackList = parseTrackList(tokens)
    return documentActions.actions.setDocumentValue({
        tokens,
        trackList
    })
}

export function setDocumentPartialStringValue(sourceString: string, trackName: string) {
    const {document: oldDocument} = store.getState();
    const {start, end} = oldDocument.trackList[trackName];
    const partialTokens = sourceToTokens(sourceString);
    const tokens = [...oldDocument.tokens];
    tokens.splice(start, end - start, ...partialTokens)
    const trackList = parseTrackList(tokens)
    return documentActions.actions.setDocumentValue({
        tokens,
        trackList
    })
}

export function setActiveEditorPosition(trackName: string, cursorPosition: number) {
    return documentActions.actions.setActiveEditorPosition({
        trackName,
        cursorPosition
    })
}


export const {
    openActiveEditor
    // setDocumentValue,
    // setEditorPartialValue
} = documentActions.actions