"use client"

import React, {useCallback, useEffect, useMemo, useRef} from 'react'
import {useDispatch, useSelector} from "react-redux";
import {ActiveEditor, RootState} from "../types";
import {TrackRange} from "@songwalker/types";
import styles from "./SourceEditor.module.scss"
import {EditorNodeManager} from "@songwalker-editor/document/EditorNodeManager";
import {setDocumentTrackValue} from "@songwalker-editor/document/documentActions";


interface SourceEditorProps {
    trackInitialValue: string,
    activeEditor: ActiveEditor,
    trackRange: TrackRange
}

export interface EditorState {
    value: string,
    cursorPosition: number
}

export default function SourceEditor({trackInitialValue, activeEditor, trackRange}: SourceEditorProps) {
    console.log('SourceEditor', trackInitialValue, activeEditor, trackRange)
    const {trackName, mode} = activeEditor;
    const dispatch = useDispatch();
    const config = useSelector((state: RootState) => state.config);
    let updateTimeout: number | null = null;

    const refEditor = useRef<HTMLInputElement>(null);
    const nodeManager = useMemo(() => new EditorNodeManager(refEditor,
            config,
            {value: trackInitialValue, cursorPosition: 0}),
        [trackName])

    useEffect(() => {
        const cursorPosition = nodeManager.getLastCursorPosition();
        console.log('cursorPosition', cursorPosition)
        nodeManager.render(trackInitialValue);
        if (cursorPosition > 0)
            nodeManager.setCursorPosition(cursorPosition);
        nodeManager.retainEditorState(0, trackInitialValue)
        // setEditorPosition(getEditor(), cursorPosition)
        return () => {
            updateTimeout && window.clearTimeout(updateTimeout);
            nodeManager.unload();
        }

    }, [nodeManager, trackInitialValue, updateTimeout]);

    const handleEvent = useCallback((e: React.SyntheticEvent<HTMLDivElement>) => nodeManager.handleEvent(e), [nodeManager])
    const handleChangeEvent = useCallback((e: React.SyntheticEvent<HTMLDivElement>) => {
        nodeManager.handleEvent(e);
        console.log('handleChangeEvent', e)
        updateTimeout && window.clearTimeout(updateTimeout)
        updateTimeout = window.setTimeout(() => {
            dispatch(setDocumentTrackValue(trackRange, nodeManager.getValue()))
        }, config.editorUpdateTimeout)
    }, [])

    return (
        <div className={styles.container}>
            <div className={styles.title}>{trackName}</div>
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

