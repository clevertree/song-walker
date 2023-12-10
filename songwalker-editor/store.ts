import {configureStore} from "@reduxjs/toolkit";
import {menuSlice} from "@songwalker-editor/menu/menuActions";
import {documentActions} from "@songwalker-editor/document/documentActions";


const store = configureStore({
    reducer: {
        menu: menuSlice.reducer,
        document: documentActions.reducer
    }
})
export default store;


// const trackReducers: { [key: string]: Reducer } = {};

// export function addTrackReducer(trackKey: string, trackReducer: Reducer) {
//     if (trackReducers.hasOwnProperty(trackKey))
//         throw new Error("Track reducer key already exists: " + trackKey);
//     trackReducers[trackKey] = trackReducer;
//     store.replaceReducer(combineReducers({
//         ...defaultReducer,
//         ...trackReducers
//     }))
// }
//
// export function removeTrackReducer(trackKey: string) {
//     if (!trackReducers.hasOwnProperty(trackKey))
//         throw new Error("Track reducer key does not exist: " + trackKey);
//     delete trackReducers[trackKey];
//     store.replaceReducer(combineReducers({
//         ...defaultReducer,
//         ...trackReducers
//     }))
// }
