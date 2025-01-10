"use client"

import React, {useContext, useEffect, useMemo, useRef} from 'react'
import {IAppContext, ISourceEditorState} from "../types";
import styles from "./SourceEditor.module.scss"
import {getCaretOffset, renderSourceEditor, renderValue} from "@songwalker-editor/helper/sourceHelper";
import Undo from "undoh";
import {EditorContext} from "@songwalker-editor/context";
import {insertIntoSelection, isMac} from "@songwalker-editor/helper/domHelper";


const TIMEOUT_SAVE_ON_CHANGE_EVENT = 500
let saveTimeout: any = null;

export default function SourceEditor(state: ISourceEditorState) {
    const {path, value, cursorPosition} = state;
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
        saveTimeout = setTimeout(() => {
            const newState = updateState();
            undoBuffer.retain(newState)
        }, TIMEOUT_SAVE_ON_CHANGE_EVENT) as any
    }

    function handleKeyEvent(e: React.SyntheticEvent<HTMLDivElement>) {
        switch (e.type) {
            default:
                break;
            // case 'click':
            //     console.log(e.type, e);
            //     let cursorNode = findEditorNode(e.target as Node, this.getNode());
            //     if (cursorNode)
            //         this.setCursorNode(cursorNode);
            //     break;
            // case 'focus':
            //     this.midiEventListener = (e: MIDIMessageEvent) => console.log("MIDI", e.data, e.timeStamp, this.trackName);
            //     addMIDIEventListener(this.midiEventListener)
            //     break;
            // case 'blur':
            //     if (this.midiEventListener)
            //         removeMIDIEventListener(this.midiEventListener)
            //     break;
            //
            // // this.setCursorPosition(this.lastCursorPosition)
            // // break;
            // case 'input':
            //     this.refreshNode()
            //     break;
            // case 'keyup':
            //     this.getCursorPosition();
            //     const focusNode = this.getFocusNode();
            //     if (focusNode)
            //         this.setCursorNode(focusNode)
            //     this.startRetainTimeout(config.editorRetainTimeout);
            //     break;
            case 'keydown':
                let ke = e as React.KeyboardEvent<HTMLDivElement>
                switch (ke.code) {
                    case 'Enter':
                        ke.preventDefault();
                        insertIntoSelection("\n")
                        return;
                    // case 'Tab': // TODO group shift?
                    //     e.preventDefault();
                    //     insertIntoOffset("\t")
                    //     return;
                    case 'KeyZ':
                        if (ke[isMac(navigator) ? 'metaKey' : 'ctrlKey']) {
                            ke.preventDefault();
                            if (ke.shiftKey) {
                                const redoValue = undoBuffer.redo();
                                console.log('redoValue', redoValue)
                                updateState(redoValue)
                            } else {
                                const undoValue = undoBuffer.undo();
                                console.log('undoValue', undoValue)
                                updateState(undoValue)
                            }
                        }
                        return;
                    // case 'ControlLeft':
                    //     e.preventDefault();
                    //     setEditorPosition(getEditorPosition() - 1);
                    //     console.log(e.code)
                    //     break;
                    default:
                        // console.log(e.key)
                        break;
                }
                break;
        }
    }

    function updateState(newState ?: ISourceEditorState) {
        const editor = getEditor();
        if (!newState) {
            newState = {
                value: renderValue(editor),
                path,
                cursorPosition: getCaretOffset(editor) || 0
            }
        }
        updateAppState((prevState) => {
            if (newState)
                prevState.activeEditor = newState;
            return {...prevState};
        })
        return newState;
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
                onKeyDown={handleKeyEvent}
                onKeyUp={handleKeyEvent}
                onInput={handleChangeEvent}
                // onFocus={handleEvent}
                // onMouseDown={handleEvent}
                // onMouseUp={getCursorPosition}
            />
            {/*{errorMessages.map(message => <div key={message} className={styles.errorMessage}>{message}</div>)}*/}
        </div>
    )
}


