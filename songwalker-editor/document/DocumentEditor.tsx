"use client"

import React, {useEffect, useRef} from 'react'
import {IDocumentState} from "../types";
import styles from "./SourceEditor.module.scss"
import {sourceToTokens} from "@songwalker/src/compiler/compiler";
import {mapTokensToDOM} from "@songwalker-editor/domUtils";

interface DocumentEditorProps {
    state: IDocumentState
}

const TIMEOUT_SAVE_ON_CHANGE_EVENT = 500
let saveTimeout: any = null;

export default function DocumentEditor({state}: DocumentEditorProps) {
    const {path, value: initialValue} = state;
    // const errors = useSelector((state: EditorState) => state.document.errors);
    // const updateTimeout = useRef(-1); // we can save timer in useRef and pass it to child
    // const playbackManager = useContext(PlaybackContext)
    const refEditor = useRef<HTMLInputElement>(null);
    useEffect(() => {
        setValue(initialValue);
    }, []);

    function getEditor() {
        const divEditor = refEditor.current;
        if (!divEditor)
            throw new Error("Editor ref is unavailable");
        return divEditor;
    }

    function setValue(value: string) {
        state.value = value;
        const tokenList = sourceToTokens(value);
        const caretOffset = getCaretOffset();
        console.log('render', tokenList, caretOffset)

        mapTokensToDOM(tokenList, getEditor(), (newNode, charOffset, length) => {
            if (caretOffset && (charOffset - length >= caretOffset) && (charOffset < caretOffset)) {
            }
        });

        const renderedValue = renderValue();
        if (renderedValue !== value)
            console.error(`Rendering value mismatch: \n`, renderedValue, ` !== \n`, value);
    }

    function renderValue() {
        return Array.prototype.map.call(getEditor().childNodes,
            child => child.innerText || child.textContent).join('');
    }

    function getCaretOffset() {
        let caretOffset = null;
        let sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            debugger;
            var range = sel.getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(getEditor());
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
        return caretOffset;
    }

    function handleChangeEvent(e: any) {
        clearTimeout(saveTimeout)
        saveTimeout = setTimeout(() => setValue(renderValue()), TIMEOUT_SAVE_ON_CHANGE_EVENT) as any
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

