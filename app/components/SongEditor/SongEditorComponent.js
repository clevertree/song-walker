"use client"

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import songSource from "/app/song/test.song.source.js";

console.log('songSource', songSource)
import {LANGUAGE} from "/songWalker/lang/song";
import Prism from "prismjs";
import styles from "./SongEditorComponent.module.scss"

export default function SongEditorComponent() {

    const refEditor = useRef();

    useEffect(() => {
        refEditor.current.innerHTML = "";
        renderMarkup(refEditor.current, songSource)
    });

    const onInput = (e) => updateNode(e)
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
        const editorValue = refEditor.current.innerText;
        refEditor.current.innerHTML = ''
        renderMarkup(refEditor.current, editorValue)
        console.log('editorValue', editorValue)

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
        console.log('setEditorPosition', editorPosition);

        let offset = 0;
        const result = walkDOM(refEditor.current, (childNode) => {
            if (childNode.nodeType !== Node.TEXT_NODE)
                return false;
            const newOffset = offset + childNode.nodeValue.length;
            if (newOffset > editorPosition) {
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
        let parsedTokenList = Prism.tokenize(sourceString, LANGUAGE);
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

    function handleKeyPress(e) {
        switch (e.type) {
            case 'keydown':
                switch (e.code) {
                    case 'Enter':
                        e.preventDefault();
                        const {focusNode, focusOffset} = window.getSelection();

                        const source = focusNode.nodeValue;
                        focusNode.nodeValue = source.substring(0, focusOffset) + "\n" + source.substring(focusOffset);
                        // setValue(refEditor.current.innerText)
                        const range = document.createRange()

                        range.setStart(focusNode, focusOffset + 1)
                        range.collapse(true)

                        const sel = window.getSelection()
                        sel.removeAllRanges()
                        sel.addRange(range)
                        break;
                    case 'ControlLeft':
                        e.preventDefault();
                        setEditorPosition(getEditorPosition() - 1);
                        console.log(e.code)
                        break;
                }
                break;
            default:
                getEditorPosition();
        }
    }

    return (
        <div
            className={styles.editor}
            contentEditable
            spellCheck={false}
            suppressContentEditableWarning
            ref={refEditor}
            onKeyUp={handleKeyPress}
            onKeyDown={handleKeyPress}
            onInput={onInput}
            onMouseUp={() => (getEditorPosition())}
            // onMouseDown={onMouseDown}
            // onMouseUp={onMouseUp}
        >
        </div>
    )
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