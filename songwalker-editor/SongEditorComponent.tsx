"use client"

import React, {useEffect} from 'react'
import {Provider, useDispatch, useSelector} from "react-redux";

import styles from "./SongEditorComponent.module.scss"
import MenuPanel from "./menu/MenuPanel";
import store from "./store";
import {openActiveEditor, setEditorStringValue} from "@songwalker-editor/document/documentActions";
import {RootState} from "@songwalker-editor/types";
import SourceEditor from "@songwalker-editor/document/SourceEditor";
import {ROOT_TRACK} from "@songwalker/tokens";

interface SongEditorComponentProps {
    initialValue: string,
    className: string
}

export default function SongEditorComponent(props: SongEditorComponentProps) {
    const {className} = props;
    return (
        <Provider store={store}>
            <div
                className={styles.container + (className ? ' ' + className : '')}
            >
                <MenuPanel/>
                <ActiveEditors {...props} />
            </div>
        </Provider>)
}


export function ActiveEditors({initialValue}: SongEditorComponentProps) {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setEditorStringValue(initialValue))
        dispatch(openActiveEditor({trackName: ROOT_TRACK, mode: "full"}))
        dispatch(openActiveEditor({trackName: 'track1', mode: "track"}))
    }, [dispatch, initialValue]);
    const {activeEditors} = useSelector((state: RootState) => state.document);
    // console.log('activeEditors', activeEditors)
    return (
        <div>
            {activeEditors.map(activeEditor => (
                <SourceEditor key={activeEditor.trackName} {...activeEditor}/>
            ))}
        </div>
    )
}