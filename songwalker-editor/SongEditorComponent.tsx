"use client"

import React, {useMemo} from 'react'
import {Provider} from "react-redux";

import styles from "./SongEditorComponent.module.scss"
import MenuPanel from "./menu/MenuPanel";
import createStore from "./store";
import {ActiveEditors} from "@songwalker-editor/document/ActiveEditors";
import {setDocumentValue} from "@songwalker-editor/document/documentActions";
import {PlaybackProvider} from "@songwalker-editor/playback/PlaybackProvider";

interface SongEditorComponentProps {
    initialValue: string,
    className: string
}

export default function SongEditorComponent(props: SongEditorComponentProps) {
    const {className, initialValue} = props;
    const store = useMemo(() => {
        const store = createStore();
        store.dispatch(setDocumentValue(initialValue))
        return store;
    }, [initialValue])
    console.log('SongEditorComponent', props, store);
    return (
        <Provider store={store}>
            <PlaybackProvider>
                <div
                    className={styles.container + (className ? ' ' + className : '')}
                >
                    <MenuPanel/>
                    <ActiveEditors/>
                </div>
            </PlaybackProvider>
        </Provider>)
}

