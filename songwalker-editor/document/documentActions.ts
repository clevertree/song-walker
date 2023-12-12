import {createSlice} from "@reduxjs/toolkit";
import {WritableDraft} from "immer/src/types/types-external";
import {ActiveEditor, DocumentState} from "@songwalker-editor/types";
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
        setDocumentValue(
            state: WritableDraft<DocumentState>,
            action: {
                payload: string,
            }
        ) {
            const sourceString = action.payload;
            const tokens = sourceToTokens(sourceString);
            const trackList = parseTrackList(tokens)
            state.tokens = tokens;
            state.trackList = trackList;
        },
        setDocumentTrackValue(
            state: WritableDraft<DocumentState>,
            action: {
                payload: {
                    sourceString: string,
                    trackName: string
                }
            }
        ) {
            const {trackName, sourceString} = action.payload;
            const {start, end} = state.trackList[trackName];
            const partialTokens = sourceToTokens(sourceString);
            const tokens = [...state.tokens];
            tokens.splice(start, end - start, ...partialTokens)
            const trackList = parseTrackList(tokens)

            state.tokens = tokens;
            state.trackList = trackList;
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

export function setActiveEditorPosition(trackName: string, cursorPosition: number) {
    return documentActions.actions.setActiveEditorPosition({
        trackName,
        cursorPosition
    })
}

export function setDocumentTrackValue(trackName: string, sourceString: string) {
    return documentActions.actions.setDocumentTrackValue({
        trackName,
        sourceString
    })
}


export const {
    openActiveEditor,
    setDocumentValue,
} = documentActions.actions