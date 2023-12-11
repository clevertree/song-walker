"use client"

import React, {useMemo, useRef} from 'react'
import Undo from "undoh";

import {insertIntoSelection, walkDOM} from "../domUtils";
import {useDispatch, useSelector} from "react-redux";
import {ActiveEditor, RootState} from "../types";
import {setEditorPartialStringValue} from "@songwalker-editor/document/documentActions";
import {TokenItemOrString} from "@songwalker/types";
import {tokensToSource} from "@songwalker/tokens";
import styles from "./SourceEditor.module.scss"

let saveTimeout: string | number | NodeJS.Timeout | undefined;

export default function SourceEditor(props: ActiveEditor) {
    // const [editorPosition, setEditorPosition] = useState(0)
    const dispatch = useDispatch();
    const {tokens, trackList} = useSelector((state: RootState) => state.document);
    const trackRange = trackList[props.trackName];
    if (!trackRange)
        throw new Error("Invalid track name: " + props.trackName + JSON.stringify(trackList))
    let partialTokenList = tokens.slice(trackRange.start, trackRange.end);
    console.log('partialTokenList', tokens, trackList, partialTokenList)
    // const documentValue: string = useSelector((state: RootState) => state.document.value);

    const undoBuffer = useMemo(() => new Undo(tokensToSource(partialTokenList)), [props.trackName])
    const refEditor = useRef<HTMLInputElement>(null);

    function getEditor() {
        if (!refEditor.current)
            throw new Error("Editor ref is unavailable")
        return refEditor.current;
    }

    function getValue() {
        return getEditor().innerText
    }

    function updateNode() {
        clearTimeout(saveTimeout)
        saveTimeout = setTimeout(() => {
            const editorPosition = getEditorPosition();
            if (editorPosition === -1)
                throw new Error("Invalid Editor Cursor");
            const editorValue = getValue();
            console.log('editorValue', editorPosition, editorValue)
            // renderMarkup(getEditor(), editorValue)
            dispatch(setEditorPartialStringValue(editorValue, tokens, trackRange.start, trackRange.end))
            saveTimeout = setTimeout(() => {
                setEditorPosition(editorPosition)
                
            }, 1);
        }, 1000)
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

    function setEditorPosition(editorPosition: number) {
        if (editorPosition < 0)
            throw new Error("Invalid editor position: " + editorPosition)


        const result = walkDOM(getEditor(), (childNode, offset) => {
            if (childNode.nodeType !== Node.TEXT_NODE)
                return false;
            if (childNode.nodeValue === null)
                throw new Error('childNode.nodeValue === null')
            const newOffset = offset + childNode.nodeValue.length;
            if (newOffset >= editorPosition) {
                const focusOffset = editorPosition - offset;
                const range = document.createRange()

                range.setStart(childNode, focusOffset)
                // range.collapse(true)

                const sel = window.getSelection()
                if (!sel)
                    throw new Error("Invalid window.getSelection()");
                sel.removeAllRanges()
                sel.addRange(range)
                setTimeout(() => {
                    if (getEditorPosition() !== editorPosition)
                        throw new Error(`getEditorPosition() !== setEditorPosition.editorPosition ${getEditorPosition()} != ${editorPosition}`)

                }, 500)
                console.log('setEditorPosition', editorPosition, focusOffset, childNode, sel, range);
                // console.log('setEditorPosition', offset, editorPosition, childNode, focusOffset);
                return true;
            }
        })
        if (!result)
            throw new Error("Reached end of editor. Position not found: " + editorPosition)

    }

    // function compileSongToCallback(trackTokenList: {}) {
    //     // Compiling
    //     try {
    //         const javascriptContent
    //             = compileTrackTokensToJavascript(trackTokenList, {
    //             eventMode: true,
    //             // exportStatement: 'module.exports='
    //         })
    //         eval(javascriptContent);
    //         // console.log('renderedSongCallback', renderedSongCallback, javascriptContent)
    //     } catch (e) {
    //         console.error("TODO", e);
    //     }
    // }

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
                        console.log('redoValue', redoValue, tokens, trackRange.start, trackRange.end)
                        dispatch(setEditorPartialStringValue(redoValue, tokens, trackRange.start, trackRange.end))
                    } else {
                        const undoValue = undoBuffer.undo();
                        console.log('undoValue', undoValue, tokens, trackRange.start, trackRange.end)
                        dispatch(setEditorPartialStringValue(undoValue, tokens, trackRange.start, trackRange.end))
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
            key={props.trackName}
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
            {partialTokenList.map((token, i) => {
                return renderToken(token, trackRange.start + i)
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