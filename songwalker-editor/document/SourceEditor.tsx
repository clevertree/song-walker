"use client"

import React, {useCallback, useContext, useEffect, useMemo, useRef} from 'react'
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../types";
import styles from "./SourceEditor.module.scss"
import {EditorNodeManager} from "@songwalker-editor/document/EditorNodeManager";
import {setDocumentTrackValue} from "@songwalker-editor/document/documentActions";
import {PlaybackContext} from "@songwalker-editor/playback/PlaybackContext";


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
    const errors = useSelector((state: RootState) => state.document.errors);
    const updateTimeout = useRef(-1); // we can save timer in useRef and pass it to child
    const playbackManager = useContext(PlaybackContext)
    console.log('errors', errors)
    const refEditor = useRef<HTMLInputElement>(null);
    const nodeManager = useMemo(() => new EditorNodeManager(refEditor,
            trackName,
            {value: trackValue, cursorPosition: 0}),
        [trackName])

    useEffect(() => {
        playbackManager.addTrackEventHandler(trackName, nodeManager.handleSongEvent.bind(nodeManager))
    }, [playbackManager]);

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

    const handleEvent = useCallback((e: React.SyntheticEvent<HTMLDivElement>) => nodeManager.handleInputEvent(e, config), [nodeManager])
    const handleChangeEvent = useCallback((e: React.SyntheticEvent<HTMLDivElement>) => {
        nodeManager.handleInputEvent(e, config);
        console.log('handleChangeEvent', e)
        updateTimeout.current && window.clearTimeout(updateTimeout.current);
        updateTimeout.current = window.setTimeout(() => {
            dispatch(setDocumentTrackValue(trackName, nodeManager.getValue()))
        }, config.editorUpdateTimeout)
    }, [config.editorUpdateTimeout, dispatch, nodeManager, trackName])

    let errorClass = '';
    for (const error of errors)
        if (error.trackName === trackName)
            errorClass = ' ' + styles.editorError
    return (
        <div className={styles.container}>
            <div className={styles.title}>[{trackName}]</div>
            <div
                key={trackName}
                className={styles.editor + errorClass}
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

