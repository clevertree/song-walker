import {configureStore} from "@reduxjs/toolkit";
import {documentActions, setDocumentTrackValue, setDocumentValue} from "./documentActions";

describe('documentActions', () => {
    let store
    beforeEach(() => {
        store = configureStore({
            reducer: {
                document: documentActions.reducer,
            }
        })
    })
    it('setDocumentPartialStringValue', () => {
        store.dispatch(setDocumentValue("C4 1 D4 1 \n[track1] C4 2 D4:1"))
        cy.log(store.getState().document.value)
        store.dispatch(setDocumentTrackValue('track2', "F4 1 F4:2"))
        cy.log(store.getState().document.value)
    })
})


