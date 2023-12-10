import {createSlice} from "@reduxjs/toolkit";
import {WritableDraft} from "immer/src/types/types-external";

export type MenuState = {
    isPlaying: boolean,
}
// First approach: define the initial state using that type
const initialState: MenuState = {
    isPlaying: false
}

export const menuSlice = createSlice({
    name: 'editorState',
    initialState,
    reducers: {
        startPlayback: function startPlayback(state: WritableDraft<MenuState>) {
            if (state.isPlaying)
                throw new Error("Playback has already started")
            state.isPlaying = true
        },
        stopPlayback: function stopPlayback(state: WritableDraft<MenuState>) {
            if (!state.isPlaying)
                throw new Error("Playback has already stopped")
            state.isPlaying = false
        },
    },
})

export const {
    startPlayback,
    stopPlayback
} = menuSlice.actions