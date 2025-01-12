"use client"

import React, {ReactNode, useContext, useEffect, useMemo, useRef} from 'react'
import {IAppContext, ISourceEditorCursorRange, ISourceEditorState} from "../types";
import styles from "./SourceEditor.module.scss"
import {getSelectionRange, renderSourceEditor} from "@songwalker-editor/helper/sourceHelper";
import Undo from "undoh";
import {EditorContext} from "@songwalker-editor/context";
import {insertIntoSelection, isMac} from "@songwalker-editor/helper/domHelper";
import {compileSongToCallback, sourceToTokens} from "@songwalker/compiler/compiler";
import {playSong} from "@songwalker";
import {Token} from "prismjs";


const TIMEOUT_SAVE_ON_CHANGE_EVENT = 500
let saveTimeout: any = null;

export default function SourceEditor(state: ISourceEditorState) {
    const {path, value, cursorRange} = state;
    let shadowValue = value;
    const {updateAppState} = useContext<IAppContext>(EditorContext)
    const undoBuffer = useMemo(() => new Undo<ISourceEditorState>(state), []);
    // const errors = useSelector((state: EditorState) => state.document.errors);
    // const updateTimeout = useRef(-1); // we can save timer in useRef and pass it to child
    // const playbackManager = useContext(PlaybackContext)
    const refEditor = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const editor = getEditor();
        editor.focus()
        renderSourceEditor(editor, value, cursorRange)
    });

    function getEditor() {
        const divEditor = refEditor.current;
        if (!divEditor)
            throw new Error("Editor ref is unavailable");
        return divEditor;
    }

    function handleChangeEvent(e: any) {
        const cursorRange = getSelectionRange(getEditor());
        console.log(getEditor().innerText, cursorRange)
        clearTimeout(saveTimeout)
        saveTimeout = setTimeout(() => {
            const newState = updateState({
                value: getEditor().innerText,
                path,
                cursorRange
            });
            undoBuffer.retain(newState)
        }, TIMEOUT_SAVE_ON_CHANGE_EVENT) as any
    }

    function handlePasteEvent(event: ClipboardEvent) {
        console.log('paste', event);
        if (!event.clipboardData)
            throw new Error("Invalid clipboard data");
        event.clipboardData.clearData('text/html')
        const pastedString = event.clipboardData.getData('text/plain');
        const range = getSelectionRange(getEditor())
        const newValue = value.substring(0, range.start)
            + pastedString
            + value.substring(range.end)
        debugger;
    }

    function handleKeyEvent(e: React.KeyboardEvent<HTMLDivElement>) {
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
                switch (e.code) {
                    case 'Tab':
                    case 'CapsLock':
                    case 'Shift':
                    case 'Control':
                        return;
                    case 'Enter':
                        e.preventDefault();
                        insertIntoSelection("\n")
                        return;
                    // case 'Tab': // TODO group shift?
                    //     e.preventDefault();
                    //     insertIntoOffset("\t")
                    //     return;
                    case 'KeyZ':
                        if (e[isMac(navigator) ? 'metaKey' : 'ctrlKey']) {
                            e.preventDefault();
                            if (e.shiftKey) {
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
                        // const range = getSelectionRange(getEditor());
                        // shadowValue = insertAtRange(e.key, shadowValue, range)
                        console.log(e)
                        break;
                }
                break;
        }
    }

    function updateState(newState: ISourceEditorState) {
        // const editor = getEditor();
        // if (!newState) {
        //     newState = {
        //         value: renderValue(editor),
        //         path,
        //         cursorRange: getSelectionRange(editor) || 0
        //     }
        // }
        updateAppState((prevState) => {
            if (newState)
                prevState.activeEditor = newState;
            return {...prevState};
        })
        return newState;
    }

    async function startPlayback(e: any) {
        const callback = compileSongToCallback(value);
        console.log('callback', callback)
        await playSong(callback)
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
    const tokenList = useMemo(() => sourceToTokens(value), [value]);

    return (
        <div className={styles.container}>
            <div className={styles.title}>[{path}]</div>
            <button
                onClick={startPlayback}
            >play
            </button>
            <div
                key={path}
                className={styles.editor}
                ref={refEditor}
                contentEditable={'plaintext-only'}
                spellCheck={false}
                // onKeyDown={handleKeyEvent}
                // onKeyUp={handleKeyEvent}
                onInput={handleChangeEvent}
                // onPaste={handlePasteEvent}
                // suppressContentEditableWarning

                // onFocus={handleEvent}
                // onMouseDown={handleEvent}
                // onMouseUp={getCursorPosition}
            />
            {/*    {tokenList.map(tokenToComponent)}*/}
            {/*</div>*/}
            {/*{errorMessages.map(message => <div key={message} className={styles.errorMessage}>{message}</div>)}*/}
        </div>
    )
}

function tokenToComponent(token: Token | string, tokenID: number): ReactNode {
    if (typeof token === "string") {
        return token;
    } else {
        if (Array.isArray(token.content)) {
            return React.createElement(token.type, {key: tokenID}, token.content.map(tokenToComponent).join(''))
        } else if (typeof token.content === "string") {
            return React.createElement(token.type, {key: tokenID}, token.content)
        } else {
            throw 'invalid token.content';
        }
    }
}

function insertAtRange(insertValue: string, documentValue: string, range: ISourceEditorCursorRange) {
    const {start, end, collapsed} = range;
    const newValue = documentValue.substring(0, start)
        + insertValue
        + documentValue.substring(end);
    return newValue
}
