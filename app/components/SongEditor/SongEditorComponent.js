"use client"

import React, {useEffect, useRef, useState} from 'react'
import songSource from "/app/song/test.song.source.js";
import Undo from "undoh";

import styles from "./SongEditorComponent.module.scss"
import {sourceToTokens} from "../../../songWalker/song/compiler";

export default function SongEditorComponent() {
    const [buffer, setBuffer] = useState(null)
    const refEditor = useRef();

    useEffect(() => {
        refEditor.current.innerHTML = "";
        renderMarkup(refEditor.current, songSource)
        const buffer = new Undo(songSource);
        buffer.retain(songSource)
        setBuffer(buffer);
    }, []);

    // const onInput = (e) => updateNode(e)
    // const onMouseDown = (e) => getRange()
    // const onMouseUp = (e) => getRange()

    function getValue() {
        const textContent = refEditor.current.innerText;
        console.log('textContent', textContent)
        return textContent
    }

    function updateNode(e) {
        const {focusNode, focusOffset} = window.getSelection();
        // let targetNode = focusNode;
        // if (focusNode.parentNode !== refEditor.current) {
        //     targetNode = focusNode.parentNode;
        // }

        const editorPosition = getEditorPosition();
        if (editorPosition === -1)
            throw new Error("Invalid Editor Cursor");
        const editorValue = refEditor.current.innerText;
        refEditor.current.innerHTML = ''
        renderMarkup(refEditor.current, editorValue)
        console.log('editorValue', editorValue)
        buffer.retain(editorValue)

        // const prevNode = targetNode.previousSibling;
        // const nextNode = targetNode.nextSibling;
        // const source = getNodeTextContent(prevNode) + focusNode.nodeValue + getNodeTextContent(nextNode);
        // renderMarkup(refEditor.current, source, prevNode);
        // console.log('updateNode', source, editorPosition);
        // prevNode.remove();
        // nextNode.remove();
        // focusNode.remove();
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
        let offset = 0;
        let editorPosition = -1;
        const result = walkDOM(refEditor.current, (childNode) => {
            if (childNode === focusNode) {
                editorPosition = offset + focusOffset
                return true;
            }
            if (childNode.nodeType === Node.TEXT_NODE) {
                offset += childNode.nodeValue.length;
                // console.log('childNode.nodeValue.length', JSON.stringify(childNode.nodeValue), offset)
            }
        })
        if (!result)
            console.error("focusNode not found in editor: ", focusNode, focusOffset);
        console.log('getEditorPosition', editorPosition);
        return editorPosition;
    }

    function setEditorPosition(editorPosition) {
        if (editorPosition < 0)
            throw new Error("Invalid editor position: " + editorPosition)

        console.log('setEditorPosition', editorPosition);

        let offset = 0;
        const result = walkDOM(refEditor.current, (childNode) => {
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
            offset = newOffset;
        })
        if (!result)
            throw new Error("Reached end of editor. Position not found: " + editorPosition)

    }

    function renderMarkup(container, sourceString, insertBeforeElm = null) {
        let parsedTokenList = sourceToTokens(sourceString);
        console.log('renderMarkup', parsedTokenList)
        for (const token of parsedTokenList) {
            if (typeof token === "string") {
                let textElm;
                if (token.trim().length > 0) {
                    textElm = document.createElement('span');
                    textElm.setAttribute('data-token-type', 'unknown');
                    textElm.innerText = token.content || token;
                } else {
                    textElm = document.createTextNode(token);
                }
                insertBeforeElm ? container.insertBefore(textElm, insertBeforeElm) : container.appendChild(textElm);
            } else {
                const spanElm = document.createElement('span');
                spanElm.setAttribute('data-token-type', token.type);
                spanElm.innerText = token.content || token;
                insertBeforeElm ? container.insertBefore(spanElm, insertBeforeElm) : container.appendChild(spanElm);
            }
        }
    }

    function handleKeyDown(e) {
        switch (e.code) {
            case 'Enter':
                e.preventDefault();
                insertIntoOffset("\n")
                return;
            case 'Tab': // TODO group shift?
                e.preventDefault();
                insertIntoOffset("\t")
                return;
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
                getEditorPosition();
                break;
        }
    }

    return (
        <div
            className={styles.editor}
            contentEditable
            spellCheck={false}
            suppressContentEditableWarning
            ref={refEditor}
            // onKeyUp={handleKeyPress}
            onKeyDown={handleKeyDown}
            onInput={updateNode}
            onMouseUp={() => (getEditorPosition())}
            // onMouseDown={onMouseDown}
            // onMouseUp={onMouseUp}
        >
        </div>
    )
}

function insertIntoOffset(insertString) {
    const {focusNode, focusOffset} = window.getSelection();

    const source = focusNode.nodeValue;
    focusNode.nodeValue = source.substring(0, focusOffset) + insertString + source.substring(focusOffset);
    // setValue(refEditor.current.innerText)
    const range = document.createRange()

    range.setStart(focusNode, focusOffset + 1)
    range.collapse(true)

    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
}


function walkDOM(node, callback) {
    const {childNodes} = node;
    if (childNodes.length) {
        for (let i = 0; i < childNodes.length; i++) {
            const childNode = childNodes[i];
            if (callback(childNode))
                return true;
            if (childNode.nodeType === Node.ELEMENT_NODE)
                if (walkDOM(childNode, callback))
                    return true;
        }
    }
    return false; // callback never returned true
}