import React, {useEffect, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import styles from "./PlaybackPanel.module.scss";
import {RootState} from "../types";
import {startPlayback, stopPlayback} from "../document/documentActions";
import {PlaybackManager} from "./PlaybackManager";

export default function PlaybackPanel({}) {
    const dispatch = useDispatch();
    const playbackManager = useMemo<PlaybackManager>(() => new PlaybackManager(), [])

    const isPlaying = useSelector((state: RootState) => state.document.isPlaying);
    const documentValue = useSelector((state: RootState) => state.document.value);
    useEffect(() => {
        if (isPlaying) {
            if (!playbackManager.isPlaying()) {
                const songHandler = playbackManager.compileAndPlay(documentValue);
            }
        } else {
            if (playbackManager.isPlaying()) {
                playbackManager.stopAllPlayback()
            }
        }
    }, [documentValue, isPlaying, playbackManager]);


    return (
        <div className={styles.playbackPanel}>
            <button disabled={isPlaying} onClick={() => dispatch(startPlayback())}>Play</button>
            <button disabled={!isPlaying} onClick={() => dispatch(stopPlayback())}>Stop</button>
        </div>
    )
}

