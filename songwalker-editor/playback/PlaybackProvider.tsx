import React, {useEffect, useMemo, useState} from "react";
import {PlaybackManager} from "@songwalker-editor/playback/PlaybackManager";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@songwalker-editor/types";
import {SongHandler} from "@songwalker/walker";
import {PlaybackContext} from "./PlaybackContext";
import {addError, stopPlayback} from "@songwalker-editor/document/documentActions";
import {SongError} from "@songwalker/types";

interface PlaybackProviderProps {
    children: string | React.JSX.Element | React.JSX.Element[]
}

export function PlaybackProvider(props: PlaybackProviderProps) {
    const dispatch = useDispatch();
    const playbackManager = useMemo<PlaybackManager>(() => new PlaybackManager(), [])
    const isPlaying = useSelector((state: RootState) => state.document.isPlaying);
    const documentValue = useSelector((state: RootState) => state.document.value);
    const [songHandler, setSongHandler] = useState<SongHandler | null>(null)
    useEffect(() => {
        if (isPlaying) {
            if (!playbackManager.isPlaying()) {
                (async () => {
                    try {
                        const songHandler = playbackManager.compileAndPlay(documentValue);
                        setSongHandler(songHandler);
                        await songHandler.waitForSongToFinish();
                    } catch (e) {
                        console.error(e);
                        dispatch(addError(e as SongError))
                    } finally {
                        dispatch(stopPlayback())
                    }
                })();
            }
        } else {
            if (playbackManager.isPlaying()) {
                playbackManager.stopAllPlayback()
            }
        }
    }, [documentValue, isPlaying, playbackManager]);

    return <PlaybackContext.Provider value={songHandler}>
        {props.children}
    </PlaybackContext.Provider>
}