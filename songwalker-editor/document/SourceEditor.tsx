"use client"

import React, {useEffect, useMemo, useRef} from 'react'
import Undo from "undoh";

import {insertIntoSelection, walkDOM} from "../domUtils";
import {useDispatch, useSelector} from "react-redux";
import {ActiveEditor, RootState} from "../types";
import {setActiveEditorPosition, setDocumentTrackValue} from "@songwalker-editor/document/documentActions";
import {TokenItemOrString, TokenRange} from "@songwalker/types";
import {tokensToSource} from "@songwalker/tokens";
import styles from "./SourceEditor.module.scss"

let saveTimeout: string | number | NodeJS.Timeout | undefined;

interface SourceEditorProps {
    activeEditor: ActiveEditor,
    tokenRange: TokenRange
}

export default function SourceEditor({activeEditor, tokenRange}: SourceEditorProps) {
    const {trackName, cursorPosition, mode} = activeEditor;
    // const [editorPosition, setEditorPosition] = useState(0)
    const dispatch = useDispatch();
    const config = useSelector((state: RootState) => state.config);
    // const documentValue: string = useSelector((state: RootState) => state.document.value);

    const undoBuffer = useMemo(() => new Undo(tokensToSource(tokenRange.tokens)), [trackName])
    const refEditor = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditorPosition(getEditor(), cursorPosition)
    }, [cursorPosition]);

    function getEditor() {
        if (!refEditor.current)
            throw new Error("Editor ref is unavailable")
        return refEditor.current;
    }

    function getValue() {
        return getEditor().innerText
    }

    function updateNode() {
        const editorValue = getValue();

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
                        console.log('undoValue', undoValue, tokens, trackRange.start, trackRange.end)
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
            suppressContentEditableWarning
            spellCheck={false}
            onKeyDown={handleKeyDown}
            onKeyUp={getEditorPosition}
            onInput={updateNode}
            onMouseUp={getEditorPosition}
        >
            {tokenRange.tokens.map((token, i) => {
                return renderToken(token, tokenRange.start + i)
            })}
        </div>
    )
}


function renderToken(token: TokenItemOrString, key: number): any {
    if (typeof token === "string") {
        // if (token.trim().length > 0) {
        //     return <token-unknown key={key}>{token}</token-unknown>
        // } else {
        return token
        // }
    } else {
        let content = token.content;
        if (Array.isArray(content)) {
            content = content.map((token, i) => renderToken(token, i))
        }
        const Tag = token.type
        // @ts-ignore
        return <Tag key={key}>{content}</Tag>
    }
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
