import {createSlice} from "@reduxjs/toolkit";
import {WritableDraft} from "immer/src/types/types-external";
import {DocumentState} from "@songwalker-editor/types";
import {TokenList} from "@songwalker/types";
import {sourceToTokens} from "@songwalker/tokens";

const initialState: DocumentState = {
    activeEditors: [],
    tokens: []
}
export const documentActions = createSlice({
    name: 'documentSlice',
    initialState,
    reducers: {
        setEditorValue(
            state: WritableDraft<DocumentState>,
            action: { payload: TokenList }
        ) {
            state.tokens = action.payload
        },
        setEditorPartialValue: {
            reducer(
                state: WritableDraft<DocumentState>,
                action
            ) {
                const {start, end} = action.meta;
                if (end <= start)
                    throw new Error("end <= start");
                state.tokens = state.tokens.splice(start, end - start, action.payload)
            },
            prepare(payload: TokenList, start: number, end: number) {
                return {payload, meta: {start, end}, error: []}
            },
        },
        openActiveEditor: {
            reducer(
                state: WritableDraft<DocumentState>,
                action
            ) {
                const {start, end} = action.meta;
                if (end <= start)
                    throw new Error("end <= start");
                state.activeEditors.push({
                    name: action.payload,
                    range: {
                        start,
                        end
                    }
                })
            },
            prepare(payload: string, start: number, end: number) {
                return {payload, meta: {start, end}, error: []}
            },
        },
    },
});

export function setEditorStringValue(sourceString: string) {
    const tokens = sourceToTokens(sourceString);
    return documentActions.actions.setEditorValue(tokens)
}

export function setEditorPartialStringValue(sourceString: string, start: number, end: number) {
    const tokens = sourceToTokens(sourceString);
    return documentActions.actions.setEditorPartialValue(tokens, start, end)
}


export const {
    setEditorValue,
    openActiveEditor
    // setEditorPartialValue
} = documentActions.actions