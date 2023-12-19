import {configureStore} from "@reduxjs/toolkit";
import {menuSlice} from "@songwalker-editor/menu/menuActions";
import {documentActions} from "@songwalker-editor/document/documentActions";
import {configSlice} from "@songwalker-editor/config/configActions";

export default function createStore() {
    return configureStore({
        reducer: {
            menu: menuSlice.reducer,
            document: documentActions.reducer,
            config: configSlice.reducer
        }
    })
}
