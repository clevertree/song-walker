"use client"

import React, {useState} from 'react'

import styles from "./SongEditorComponent.module.scss"
import {ActiveEditors} from "@songwalker-editor/document/ActiveEditors";
import {EditorContext, initialEditorState} from "@songwalker-editor/context";
import {IEditorContext, IEditorState} from "@songwalker-editor/types";

interface SongEditorComponentProps {
    initialValue: string,
    className: string
}

export default function SongEditorComponent(props: SongEditorComponentProps) {
    const {className, initialValue} = props;
    const [editorState, setEditorState] = useState<IEditorState>(initialEditorState);
    const editorContext: IEditorContext = {
        state: editorState,
        update: setEditorState
    }
    return (
        <EditorContext.Provider value={editorContext}>
            <div
                className={styles.container + (className ? ' ' + className : '')}
            >
                {/*<MenuPanel/>*/}
                <ActiveEditors/>
            </div>
        </EditorContext.Provider>)
}

