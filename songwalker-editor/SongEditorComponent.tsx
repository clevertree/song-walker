"use client"

import React, {useEffect} from 'react'
import {Provider, useDispatch, useSelector} from "react-redux";

import styles from "./SongEditorComponent.module.scss"
import MenuPanel from "./menu/MenuPanel";
import store from "./store";
import SourceEditor from "./document/SourceEditor";
import {RootState} from "./types";
import {openActiveEditor, setEditorStringValue} from "@songwalker-editor/document/documentActions";

interface SongEditorComponentProps {
    initialValue: string,
    className: string
}

export default function SongEditorComponent({initialValue, className}: SongEditorComponentProps) {
    const dispatch = useDispatch();
    const {activeEditors} = useSelector((state: RootState) => state.document);
    useEffect(() => {
        dispatch(setEditorStringValue(initialValue))
        dispatch(openActiveEditor({trackName: 'trackRoot', mode: "full"}))
    }, [dispatch, initialValue]);
    return (
        <Provider store={store}>
            <div
                className={styles.container + (className ? ' ' + className : '')}
            >
                <MenuPanel/>
                <div>
                    {activeEditors.map(activeEditor => (
                        <SourceEditor key={activeEditor.trackName} {...activeEditor}/>
                    ))}
                </div>
            </div>
        </Provider>)
}
