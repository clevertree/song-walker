"use client"

import React, {useEffect, useRef, useState} from 'react'
import Undo from "undoh";

import styles from "./SongEditorComponent.module.scss"
import {compiler} from "/songWalker/song/compiler";
import {insertIntoSelection, walkDOM} from "./dom";
import {mapTokensToDOM} from "../../song/tokens";

export default function SongEditorComponent({initialValue, className}) {
    const [buffer] = useState(new Undo(initialValue))
    const refEditor = useRef();
    let renderedSongCallback = null;
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
        console.log('getEditorPosition', {editorPosition, focusNode, focusOffset});
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
        console.time('renderMarkup')
        const [scriptContent, parsedTokenList, trackList, errors] = compiler(sourceString, {
            debugMode: true,
            exportStatement: 'module.exports='
        });
        renderedSongCallback = eval(scriptContent);
        console.log('renderMarkup', scriptContent, parsedTokenList, trackList, errors, renderedSongCallback)
        mapTokensToDOM(parsedTokenList, container, (token) => {
            if (typeof token === "string") {
                if (token.trim().length > 0) {
                    let textElm = document.createElement('unknown');
                    // textElm.setAttribute('class', 'unknown');
                    textElm.innerText = token;
                    return textElm;
                } else {
                    return document.createTextNode(token);
                }
            } else {
                const spanElm = document.createElement(token.type);
                // spanElm.setAttribute('data-token', token.type);
                if (!Array.isArray(token.content)) { // If array of tokens, it'll be handled by recursion
                    spanElm.innerText = token.content;
                }
                return spanElm;
            }
        })
        console.timeEnd('renderMarkup')
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
                // console.log(e.key)
                break;
        }
    }

    function startPlayback() {
        const t = {
            _: (...args) => console.log('_', ...args),
            loadInstrument: (...args) => console.log('loadInstrument', ...args),
            require: (...args) => console.log('loadInstrument', ...args),
        }
        console.log('startPlayback', renderedSongCallback(t));
    }

    return (
        <div
            className={styles.container + (className ? ' ' + className : '')}
        >
            <div className={styles.menuContainer}>
                <button onClick={startPlayback}>Play</button>
            </div>
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


function walkTokens(tokenList, callback) {
    for (const token of tokenList) {
        if (callback(token))
            return true;
        if (Array.isArray(token.content)) {
            if (walkTokens(token.content))
                return true;
        }
    }
    return false;
}