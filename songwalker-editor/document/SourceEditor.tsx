"use client"

import React, {useContext, useEffect, useMemo, useRef} from 'react'
import {IAppContext, ISourceEditorState} from "../types";
import styles from "./SourceEditor.module.scss"
import {getCaretOffset, renderSourceEditor, renderValue} from "@songwalker-editor/helper/sourceHelper";
import Undo from "undoh";
import {EditorContext} from "@songwalker-editor/context";


const TIMEOUT_SAVE_ON_CHANGE_EVENT = 500
let saveTimeout: any = null;

export default function SourceEditor(state: ISourceEditorState) {
    const {path, value, cursorPosition} = state;
    console.log(state);
    const {updateAppState} = useContext<IAppContext>(EditorContext)
    const undoBuffer = useMemo(() => new Undo<ISourceEditorState>(state), []);
    // const errors = useSelector((state: EditorState) => state.document.errors);
    // const updateTimeout = useRef(-1); // we can save timer in useRef and pass it to child
    // const playbackManager = useContext(PlaybackContext)
    const refEditor = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const editor = getEditor();
        renderSourceEditor(editor, value, cursorPosition)
    });

    function getEditor() {
        const divEditor = refEditor.current;
        if (!divEditor)
            throw new Error("Editor ref is unavailable");
        return divEditor;
    }

    function handleChangeEvent(e: any) {
        clearTimeout(saveTimeout)
        saveTimeout = setTimeout(setValue, TIMEOUT_SAVE_ON_CHANGE_EVENT) as any
    }

    function setValue() {
        const editor = getEditor();
        const newSource = renderValue(editor);
        const cursorPosition = getCaretOffset(editor) || 0;
        const newState: ISourceEditorState = {value: newSource, path, cursorPosition};
        undoBuffer.retain(newState)
        updateAppState((prevState) => {
            prevState.activeEditor = newState;
            return {...prevState};
        })
    }

    // useEffect(() => {
    //     const cursorPosition = nodeManager.getLastCursorPosition();
    //     // console.log('cursorPosition', cursorPosition)
    //     nodeManager.render(trackValue);
    //     if (cursorPosition > 0)
    //         nodeManager.setCursorPosition(cursorPosition);
    //     nodeManager.retainEditorState(0, trackValue)
    //     // setEditorPosition(getEditor(), cursorPosition)
    //     return () => {
    //         updateTimeout.current && window.clearTimeout(updateTimeout.current);
    //         nodeManager.unload();
    //     }
    //
    // }, [nodeManager, trackValue, updateTimeout]);

    // let errorClass = '';
    // let errorMessages = [];
    // for (const error of state.errors)
    //     if (error.trackName === trackName) {
    //         errorClass = ' ' + styles.errorBorder
    //         errorMessages.push(`(${error.tokenID}) ${error.message}`)
    //     }
    return (
        <div className={styles.container}>
            <div className={styles.title}>[{path}]</div>
            <div
                key={path}
                className={styles.editor}
                ref={refEditor}
                contentEditable
                spellCheck={false}
                // onKeyDown={handleEvent}
                // onKeyUp={handleEvent}
                onInput={handleChangeEvent}
                // onFocus={handleEvent}
                // onMouseDown={handleEvent}
                // onMouseUp={getCursorPosition}
            />
            {/*{errorMessages.map(message => <div key={message} className={styles.errorMessage}>{message}</div>)}*/}
        </div>
    )
}


