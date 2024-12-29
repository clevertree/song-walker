import {createSlice} from "@reduxjs/toolkit";
import {WritableDraft} from "immer/src/types/types-external";
import {DocumentState} from "@songwalker-editor/types";
// import {parseTrackList} from "@songwalker/compiler";
import {SongError} from "@songwalker/types";


const initialState: DocumentState = {
    errors: [],
    mode: "track",
    value: '',
    isPlaying: false,
    activeEditors: {}
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
            state.value = action.payload;
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
            const oldValue = state.value;
            const trackList = parseTrackList(state.value);
            trackList[trackName] = sourceString;
            state.value = Object.keys(trackList).map(trackName => `[${trackName}]\n${trackList[trackName]}`).join("\n")
            // console.log('setDocumentTrackValue', action.payload, state.value, oldValue)
        },
        openActiveEditor(
            state: WritableDraft<DocumentState>,
            action: { payload: string }
        ) {
            if (state.activeEditors[action.payload]) {
                console.info("Active editor already open: " + action.payload)
            } else {
                state.activeEditors[action.payload] = true;
            }
        },
        closeActiveEditor(
            state: WritableDraft<DocumentState>,
            action: { payload: string }
        ) {
            if (!state.activeEditors[action.payload]) {
                console.info("Active editor already closed: " + action.payload)
            } else {
                state.activeEditors[action.payload] = false;
            }
        },
        startPlayback(state: WritableDraft<DocumentState>) {
            if (state.isPlaying)
                throw new Error("Playback has already started")
            state.errors = [];
            state.isPlaying = true
        },
        stopPlayback(state: WritableDraft<DocumentState>) {
            // if (!state.isPlaying)
            //     throw new Error("Playback has already stopped")
            state.isPlaying = false;
        },
        addError(state: WritableDraft<DocumentState>, action: {
            payload: SongError
        }) {
            state.errors.push(action.payload);
        },
        // setActiveEditorPosition(
        //     state: WritableDraft<DocumentState>,
        //     action: {
        //         payload: {
        //             trackName: string,
        //             cursorPosition: number
        //         }
        //     }
        // ) {
        //     const {trackName, cursorPosition} = action.payload;
        //     const activeEditor = state.activeEditors.find(editor => editor.trackName === trackName);
        //     if (!activeEditor)
        //         throw new Error("Active editor not found: " + trackName)
        //     activeEditor.cursorPosition = cursorPosition
        // },
    },
});

// export function setActiveEditorPosition(trackName: string, cursorPosition: number) {
//     return documentActions.actions.setActiveEditorPosition({
//         trackName,
//         cursorPosition
//     })
// }

export function setDocumentTrackValue(trackName: string, sourceString: string) {
    return documentActions.actions.setDocumentTrackValue({
        sourceString,
        trackName
    })
}


export function addError(error: SongError) {
    return documentActions.actions.addError({
        message: error.message,
        trackName: error.trackName,
        tokenID: error.tokenID
    })
}


export const {
    openActiveEditor,
    closeActiveEditor,
    setDocumentValue,
    startPlayback,
    stopPlayback
} = documentActions.actions
