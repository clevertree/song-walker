"use client"

import React from 'react'
import {Provider} from "react-redux";

import styles from "./SongEditorComponent.module.scss"
import MenuPanel from "./menu/MenuPanel";
import store from "./store";
import {ActiveEditors} from "@songwalker-editor/document/ActiveEditors";
import {setDocumentValue} from "@songwalker-editor/document/documentActions";

interface SongEditorComponentProps {
    initialValue: string,
    className: string
}

export default function SongEditorComponent(props: SongEditorComponentProps) {
    const {className, initialValue} = props;
    store.dispatch(setDocumentValue(initialValue))
    console.log('SongEditorComponent', props);
    return (
        <Provider store={store}>
            <div
                className={styles.container + (className ? ' ' + className : '')}
            >
                <MenuPanel/>
                <ActiveEditors/>
            </div>
        </Provider>)
}


