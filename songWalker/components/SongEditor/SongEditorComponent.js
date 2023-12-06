"use client"

import React, {useEffect, useRef, useState} from 'react'
import Undo from "undoh";

import styles from "./SongEditorComponent.module.scss"
import {compileTrackTokensToJavascript, sourceToTrackTokens} from "/songWalker/song/compiler";
import {insertIntoSelection, walkDOM} from "./dom";
import {walkSong} from "../../song/walker";

export default function SongEditorComponent({initialValue, className}) {
    const [buffer] = useState(new Undo(initialValue))
    const refEditor = useRef();
    let renderedSongCallback = null;
    useEffect(() => {
        // refEditor.current.innerHTML = "";
        renderMarkup(refEditor.current, initialValue)
    },);// [initialValue]);

    function getValue() {
        return refEditor.current.innerText
    }

    function updateNode(e) {
        const editorPosition = getEditorPosition();
        if (editorPosition === -1)
            throw new Error("Invalid Editor Cursor");
        const editorValue = getValue();
        // refEditor.current.innerHTML = ''
        renderMarkup(refEditor.current, editorValue)
        console.log('editorValue', editorValue)
        buffer.retain(editorValue)
        setEditorPosition(editorPosition)
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

    function renderMarkup(container, sourceString) {
        console.time('time:renderMarkup')
        const {tokenList, trackTokenList} = sourceToTrackTokens(sourceString);
        console.log('renderMarkup', trackTokenList, sourceString)
        mapTokensToDOM(tokenList, container)

        // Compiling
        try {
            const javascriptContent = compileTrackTokensToJavascript(trackTokenList, {
                eventMode: true,
                // exportStatement: 'module.exports='
            })
            renderedSongCallback = eval(javascriptContent);
            console.log('renderedSongCallback', renderedSongCallback, javascriptContent)
        } catch (e) {
            console.error("TODO", e);
        }
        console.timeEnd('time:renderMarkup')
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
                        // refEditor.current.innerHTML = "";
                        renderMarkup(refEditor.current, redoValue)
                    } else {
                        const undoValue = buffer.undo();
                        console.log('undoValue', undoValue)
                        // refEditor.current.innerHTML = "";
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

    return (
        <div
            className={styles.container + (className ? ' ' + className : '')}
        >
            <EditorMenuComponent/>
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

function EditorMenuComponent({}) {
    function startPlayback() {
        walkSong(renderedSongCallback);
    }

    return (
        <div className={styles.menuContainer}>
            <button onClick={startPlayback}>Play</button>
        </div>
    )
}


function mapTokensToDOM(tokenList, container) {
    let elmID = 0;
    let childNodes = container.childNodes;
    container.replaceChildren(...tokenList.map(token => {
        const oldNode = childNodes[elmID++];
        // console.log('token', token, oldNode);
        if (typeof token === "string") {
            if (token.trim().length > 0) {
                let newNode = oldNode;
                if (!newNode || newNode.nodeName !== 'UNKNOWN') {
                    newNode = document.createElement('unknown');
                } else {
                    // console.info("Reusing", oldNode);
                }
                newNode.innerText = token;
                return newNode
            } else {
                if (oldNode && oldNode.nodeType === 3) {
                    oldNode.textContent = token;
                    // console.info("Reusing", oldNode);
                    return oldNode;
                } else {
                    return document.createTextNode(token);
                }
            }
        } else {
            let newNode = oldNode;
            if (!newNode || newNode.nodeName.toLowerCase() !== token.type) {
                newNode = document.createElement(token.type);
            } else {
                // console.info("Reusing", oldNode);
            }
            if (Array.isArray(token.content)) {
                mapTokensToDOM(token.content, newNode)
            } else {
                newNode.innerText = token.content;
            }
            return newNode;
        }
    }));

}
