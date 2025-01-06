"use client"

import React, {useEffect, useRef} from 'react'
import {IDocumentState} from "../types";
import styles from "./SourceEditor.module.scss"


export default function DocumentEditor(state: IDocumentState) {
    const {path, value} = state;
    // const errors = useSelector((state: EditorState) => state.document.errors);
    // const updateTimeout = useRef(-1); // we can save timer in useRef and pass it to child
    // const playbackManager = useContext(PlaybackContext)
    const refEditor = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const divEditor = refEditor.current;
        if (divEditor) {
            divEditor.innerHTML = value;
            todo
            // const tokenList = sourceToTokens(trackValueString);
            // // console.log('render', trackValueString, tokenList)
            // mapTokensToDOM(tokenList, this.getNode())
            // if (this.getValue() !== trackValueString)
            //     console.error(`Rendering value mismatch: \n`, JSON.stringify(this.getValue()), ` !== \n`, JSON.stringify(trackValueString));

        }
    }, [value]);

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
                // onInput={handleChangeEvent}
                // onFocus={handleEvent}
                // onMouseDown={handleEvent}
                // onMouseUp={getCursorPosition}
            />
            {/*{errorMessages.map(message => <div key={message} className={styles.errorMessage}>{message}</div>)}*/}
        </div>
    )
}

