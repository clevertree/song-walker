import {configureStore} from "@reduxjs/toolkit";
import {menuSlice} from "@songwalker-editor/menu/menuActions";
import {documentActions} from "@songwalker-editor/document/documentActions";
import {configSlice} from "@songwalker-editor/config/configActions";


const store = configureStore({
    reducer: {
        menu: menuSlice.reducer,
        document: documentActions.reducer,
        config: configSlice.reducer
    }
})
export default store;

