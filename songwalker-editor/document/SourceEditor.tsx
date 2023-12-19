"use client"

import React, {useCallback, useEffect, useMemo, useRef} from 'react'
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../types";
import styles from "./SourceEditor.module.scss"
import {EditorNodeManager} from "@songwalker-editor/document/EditorNodeManager";
import {setDocumentTrackValue} from "@songwalker-editor/document/documentActions";


interface SourceEditorProps {
    trackName: string,
    trackValue: string,
}

export interface EditorState {
    value: string,
    cursorPosition: number
}

export default function SourceEditor({trackName, trackValue}: SourceEditorProps) {
    // console.log('SourceEditor', trackValue, trackName)
    const dispatch = useDispatch();
    const config = useSelector((state: RootState) => state.config);
    const updateTimeout = useRef(-1); // we can save timer in useRef and pass it to child

    const refEditor = useRef<HTMLInputElement>(null);
    const nodeManager = useMemo(() => new EditorNodeManager(refEditor,
            {value: trackValue, cursorPosition: 0}),
        [trackName])

    useEffect(() => {
        const cursorPosition = nodeManager.getLastCursorPosition();
        console.log('cursorPosition', cursorPosition)
        nodeManager.render(trackValue);
        if (cursorPosition > 0)
            nodeManager.setCursorPosition(cursorPosition);
        nodeManager.retainEditorState(0, trackValue)
        // setEditorPosition(getEditor(), cursorPosition)
        return () => {
            updateTimeout.current && window.clearTimeout(updateTimeout.current);
            nodeManager.unload();
        }

    }, [nodeManager, trackValue, updateTimeout]);

    const handleEvent = useCallback((e: React.SyntheticEvent<HTMLDivElement>) => nodeManager.handleEvent(e, config), [nodeManager])
    const handleChangeEvent = useCallback((e: React.SyntheticEvent<HTMLDivElement>) => {
        nodeManager.handleEvent(e, config);
        console.log('handleChangeEvent', e)
        updateTimeout.current && window.clearTimeout(updateTimeout.current);
        updateTimeout.current = window.setTimeout(() => {
            dispatch(setDocumentTrackValue(trackName, nodeManager.getValue()))
        }, config.editorUpdateTimeout)
    }, [config.editorUpdateTimeout, dispatch, nodeManager, trackName])

    return (
        <div className={styles.container}>
            <div className={styles.title}>[{trackName}]</div>
            <div
                key={trackName}
                className={styles.editor}
                ref={refEditor}
                contentEditable
                spellCheck={false}
                onKeyDown={handleEvent}
                onKeyUp={handleEvent}
                onInput={handleChangeEvent}
                onFocus={handleEvent}
                // onMouseUp={getCursorPosition}
            />
        </div>
    )
}

