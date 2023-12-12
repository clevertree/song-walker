import {createSlice} from "@reduxjs/toolkit";
import {WritableDraft} from "immer/src/types/types-external";

export type ConfigObject = {
    editorUpdateTimeout: number,
}
// First approach: define the initial state using that type
const initialState: ConfigObject = {
    editorUpdateTimeout: 1000
}

export const configSlice = createSlice({
    name: 'editorState',
    initialState,
    reducers: {
        setEditorUpdateTimeout(state: WritableDraft<ConfigObject>, action: { payload: number }) {
            state.editorUpdateTimeout = action.payload
        },
    },
})

export const {
    setEditorUpdateTimeout,
} = configSlice.actions