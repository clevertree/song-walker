"use client"

import React, {useState} from 'react'

import styles from "./SongEditorComponent.module.scss"
import {ActiveEditors} from "@songwalker-editor/document/ActiveEditors";
import {EditorContext} from "@songwalker-editor/context";
import {IEditorContext, IEditorState} from "@songwalker-editor/types";

interface SongEditorComponentProps {
    initialValue: string,
    className: string
}

export default function SongEditorComponent(props: SongEditorComponentProps) {
    const {className, initialValue} = props;
    const [editorState, setEditorState] = useState<IEditorState>({
        document: {
            cursorPosition: 0,
            path: 'new.sw',
            value: initialValue
        }
    });
    const editorContext: IEditorContext = {
        editor: editorState,
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

