"use client"

import React, {useEffect, useRef, useState} from 'react'
import Undo from "undoh";

import styles from "./SongEditorComponent.module.scss"
import {sourceToTokens} from "/songWalker/song/compiler";
import {insertIntoSelection, walkDOM} from "./dom";

export default function SongEditorComponent({initialValue, className}) {
    const [buffer] = useState(new Undo(initialValue))
    const refEditor = useRef();

    useEffect(() => {
        refEditor.current.innerHTML = "";
        renderMarkup(refEditor.current, initialValue)
    }, [initialValue]);

    function getValue() {
        return refEditor.current.innerText
    }

    function updateNode(e) {
        const editorPosition = getEditorPosition();
        if (editorPosition === -1)
            throw new Error("Invalid Editor Cursor");
        const editorValue = getValue();
        refEditor.current.innerHTML = ''
        renderMarkup(refEditor.current, editorValue)
        console.log('editorValue', editorValue)
        buffer.retain(editorValue)
        setEditorPosition(editorPosition)
    }

    function getNodeTextContent(childNode) {
        if (childNode.nodeType === Node.TEXT_NODE) // or if (el[i].nodeType != 3)
            return childNode.nodeValue;
        return childNode.innerText;
        // throw new Error("No children text nodes found.")
    }

    function getEditorPosition() {
        const {focusNode, focusOffset} = window.getSelection();
        let editorPosition = -1;
        const result = walkDOM(refEditor.current, (childNode, offset) => {
            if (childNode === focusNode) {
                editorPosition = offset + focusOffset
                return true;
            }
        })
        if (!result)
            console.error("focusNode not found in editor: ", focusNode, focusOffset);
        console.log('getEditorPosition', editorPosition, focusNode, focusOffset);
        return editorPosition;
    }

    function setEditorPosition(editorPosition) {
        if (editorPosition < 0)
            throw new Error("Invalid editor position: " + editorPosition)

        console.log('setEditorPosition', editorPosition);

        const result = walkDOM(refEditor.current, (childNode, offset) => {
            if (childNode.nodeType !== Node.TEXT_NODE)
                return false;
            const newOffset = offset + childNode.nodeValue.length;
            if (newOffset >= editorPosition) {
                const focusOffset = editorPosition - offset;
                const range = document.createRange()

                range.setStart(childNode, focusOffset)
                range.collapse(true)

                const sel = window.getSelection()
                sel.removeAllRanges()
                sel.addRange(range)
                console.log('setEditorPosition', offset, editorPosition, childNode, focusOffset);
                return true;
            }
        })
        if (!result)
            throw new Error("Reached end of editor. Position not found: " + editorPosition)

    }

    function renderMarkup(container, sourceString, insertBeforeElm = null) {
        let parsedTokenList = sourceToTokens(sourceString);
        console.log('renderMarkup', parsedTokenList)
        renderTokens(parsedTokenList);

        // TODO: recursive render
        function renderTokens(parsedTokenList) {
            for (const token of parsedTokenList) {
                if (typeof token === "string") {
                    let textElm;
                    if (token.trim().length > 0) {
                        textElm = document.createElement('span');
                        textElm.setAttribute('data-token-type', 'unknown');
                        textElm.innerText = token;
                    } else {
                        textElm = document.createTextNode(token);
                    }
                    insertBeforeElm ? container.insertBefore(textElm, insertBeforeElm) : container.appendChild(textElm);
                } else {
                    const spanElm = document.createElement('span');
                    spanElm.setAttribute('data-token-type', token.type);
                    if (Array.isArray(token.content)) {
                        renderTokens(token.content);
                    } else {
                        spanElm.innerText = token.content;
                    }
                    insertBeforeElm ? container.insertBefore(spanElm, insertBeforeElm) : container.appendChild(spanElm);
                }
            }
        }
    }

    function handleKeyDown(e) {
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
                        const redoValue = buffer.redo();
                        console.log('redoValue', redoValue)
                        refEditor.current.innerHTML = "";
                        renderMarkup(refEditor.current, redoValue)
                    } else {
                        const undoValue = buffer.undo();
                        console.log('undoValue', undoValue)
                        refEditor.current.innerHTML = "";
                        renderMarkup(refEditor.current, undoValue)
                    }
                }
                return;
            // case 'ControlLeft':
            //     e.preventDefault();
            //     setEditorPosition(getEditorPosition() - 1);
            //     console.log(e.code)
            //     break;
            default:
                console.log(e.key)
                break;
        }
    }

    return (
        <div
            className={styles.container + (className ? ' ' + className : '')}
        >
            <div
                ref={refEditor}
                contentEditable
                spellCheck={false}
                className={styles.editor}
                onKeyDown={handleKeyDown}
                onKeyUp={getEditorPosition}
                onInput={updateNode}
                onMouseUp={getEditorPosition}
            >
            </div>
        </div>
    )
}


