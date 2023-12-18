import {createSlice} from "@reduxjs/toolkit";
import {WritableDraft} from "immer/src/types/types-external";
import {ActiveEditor, DocumentState} from "@songwalker-editor/types";
import {TrackRange} from "@songwalker/types";

const initialState: DocumentState = {
    value: '',
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
            state.value = action.payload;
        },
        setDocumentTrackValue(
            state: WritableDraft<DocumentState>,
            action: {
                payload: {
                    sourceString: string,
                    trackRange: TrackRange
                }
            }
        ) {
            const {trackRange, sourceString} = action.payload;
            const {offsetStart, offsetEnd} = trackRange;
            const oldValue = state.value;
            state.value = oldValue.substring(0, offsetStart) + sourceString + oldValue.substring(offsetEnd);
            console.log('setDocumentTrackValue', action.payload, trackRange, state.value, oldValue.substring(0, offsetStart))
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

export function setDocumentTrackValue(trackRange: TrackRange, sourceString: string) {
    return documentActions.actions.setDocumentTrackValue({
        sourceString,
        trackRange
    })
}


export const {
    openActiveEditor,
    setDocumentValue,
} = documentActions.actions