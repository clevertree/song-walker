import {createSlice} from "@reduxjs/toolkit";

export type MenuState = {}
// First approach: define the initial state using that type
const initialState: MenuState = {}

export const menuSlice = createSlice({
    name: 'menuState',
    initialState,
    reducers: {},
})

export const {} = menuSlice.actions