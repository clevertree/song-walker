"use client"

import React, {useEffect, useMemo, useRef} from 'react'
import Undo from "undoh";

import {insertIntoSelection, mapTokensToDOM, walkDOM} from "../domUtils";
import {useDispatch, useSelector} from "react-redux";
import {ActiveEditor, RootState} from "../types";
import {setDocumentTrackValue} from "@songwalker-editor/document/documentActions";
import {TrackRange} from "@songwalker/types";
import {sourceToTokens} from "@songwalker/tokens";
import styles from "./SourceEditor.module.scss"

let saveTimeout: string | number | NodeJS.Timeout | undefined;

interface SourceEditorProps {
    trackInitialValue: string,
    activeEditor: ActiveEditor,
    tokenRange: TrackRange
}

export default function SourceEditor({trackInitialValue, activeEditor, tokenRange}: SourceEditorProps) {
    const {trackName, mode} = activeEditor;
    const dispatch = useDispatch();
    const config = useSelector((state: RootState) => state.config);
    // const [tokenList, setTokenList] = useState(tokenRange.tokens)
    // const [cursorPosition, setCursorPosition] = useState(0)
    // const documentValue: string = useSelector((state: RootState) => state.document.value);

    const undoBuffer = useMemo(() => new Undo(trackInitialValue), [trackInitialValue])
    const refEditor = useRef<HTMLInputElement>(null);

    useEffect(() => {
        render(trackInitialValue)
        // setEditorPosition(getEditor(), cursorPosition)
    }, [trackInitialValue]);

    function getEditor() {
        if (!refEditor.current)
            throw new Error("Editor ref is unavailable")
        return refEditor.current;
    }

    function getValue() {
        return getEditor().innerText
    }

    function render(trackValueString: string) {
        const cursorPosition = getEditorPosition();
        const tokenList = sourceToTokens(trackValueString);
        console.log('render', cursorPosition, trackValueString, tokenList)
        mapTokensToDOM(tokenList, getEditor())
        setCursorPosition(cursorPosition);
    }

    function updateNode() {
        const editorValue = getValue();
        render(editorValue);
        // const tokenList = sourceToTokens(editorValue);
        // const editorValue2 = tokensToSource(tokenList);
        // if (editorValue !== editorValue2)
        //     throw new Error("Invalid editorValue")
        // console.log('editorValue', cursorPosition, editorValue, tokenList)
        // dispatch(setActiveEditorPosition(trackName, cursorPosition))
        // setCursorPosition(cursorPosition);
        // getEditor().innerText = '';
        // setTokenList(tokenList);

        // clearTimeout(saveTimeout)
        // saveTimeout = setTimeout(updateEditorState, config.editorUpdateTimeout)
    }

    function updateEditorState() {
        const cursorPosition = getEditorPosition();
        if (cursorPosition === -1)
            throw new Error("Invalid Editor Cursor");
        const editorValue = getValue();
        console.log('editorValue', cursorPosition, editorValue)
        // renderMarkup(getEditor(), editorValue)

        dispatch(setActiveEditorPosition(trackName, cursorPosition))
        dispatch(setDocumentTrackValue(trackName, editorValue))
        // parse tokens immediately on editor and then update document value. after timeout
    }


    function getEditorPosition() {
        const selection: Selection | null = window.getSelection();
        if (!selection)
            throw new Error("Invalid selection")
        const {focusNode, focusOffset} = selection;
        let editorPosition = -1;
        const result = walkDOM(getEditor(), (childNode, offset) => {
            if (childNode === focusNode) {
                editorPosition = offset + focusOffset
                return true;
            }
        })
        if (!result)
            console.error("focusNode not found in editor: ", focusNode, focusOffset);
        console.log('getEditorPosition', editorPosition);
        return editorPosition;
    }


    function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        switch (e.code) {
            case 'Enter':
                e.preventDefault();
                insertIntoSelection("\n")
                return;
            // case 'Tab': // TODO group shift?
            //     e.preventDefault();
            //     insertIntoOffset("\t")
            //     return;
            case 'KeyZ':
                if (e.ctrlKey) {
                    e.preventDefault();
                    if (e.shiftKey) {
                        const redoValue = undoBuffer.redo();
                        console.log('redoValue', redoValue, tokenRange)
                        dispatch(setDocumentTrackValue(trackName, redoValue))
                    } else {
                        const undoValue = undoBuffer.undo();
                        console.log('undoValue', undoValue, tokenRange)
                        dispatch(setDocumentTrackValue(trackName, undoValue))
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
    }

    return (
        <div
            key={trackName}
            className={styles.container}
            ref={refEditor}
            contentEditable
            spellCheck={false}
            onKeyDown={handleKeyDown}
            onKeyUp={getEditorPosition}
            onInput={updateNode}
            onMouseUp={getEditorPosition}
        >
        </div>
    )
}


function setEditorPosition(editorNode: Node, cursorPosition: number) {
    if (cursorPosition < 0 || isNaN(cursorPosition))
        throw new Error("Invalid editor position: " + cursorPosition)


    const result = walkDOM(editorNode, (childNode, offset) => {
        if (childNode.nodeType !== Node.TEXT_NODE)
            return false;
        if (childNode.nodeValue === null)
            throw new Error('childNode.nodeValue === null')
        const newOffset = offset + childNode.nodeValue.length;
        if (newOffset >= cursorPosition) {
            const focusOffset = cursorPosition - offset;
            const range = document.createRange()

            range.setStart(childNode, focusOffset)
            // range.collapse(true)

            const sel = window.getSelection()
            if (!sel)
                throw new Error("Invalid window.getSelection()");
            sel.removeAllRanges()
            sel.addRange(range)
            console.log('setEditorPosition', cursorPosition, focusOffset, childNode, sel, range);
            // console.log('setEditorPosition', offset, editorPosition, childNode, focusOffset);
            return true;
        }
    })
    if (!result)
        throw new Error("Reached end of editor. Position not found: " + cursorPosition)

}
