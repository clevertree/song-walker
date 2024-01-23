import React, {useEffect, useMemo, useState} from "react";
import {PlaybackManager} from "@songwalker-editor/playback/PlaybackManager";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@songwalker-editor/types";
import {PlaybackContext} from "./PlaybackContext";
import {addError, stopPlayback} from "@songwalker-editor/document/documentActions";
import {SongError, SongHandler} from "@songwalker/types";
import {compileSongToCallback} from "@songwalker/compiler";
import {loadSongAssets} from "@songwalker/songLoader";
import {SongPlayer} from "@songwalker/walker";

interface PlaybackProviderProps {
    children: string | React.JSX.Element | React.JSX.Element[]
}

export function PlaybackProvider(props: PlaybackProviderProps) {
    const dispatch = useDispatch();
    const playbackManager = useMemo<PlaybackManager>(() => new PlaybackManager(), [])
    const isPlaying = useSelector((state: RootState) => state.document.isPlaying);
    const documentValue = useSelector((state: RootState) => state.document.value);
    const [songPlayer, setSongPlayer] = useState<SongHandler>()

    useEffect(() => {
        const callback = compileSongToCallback(documentValue)
        loadSongAssets(callback);
    });

    useEffect(() => {
        if (isPlaying) {
            if (!songPlayer) {
                (async () => {
                    try {
                        const callback = compileSongToCallback(documentValue)
                        const songPlayer = new SongPlayer(callback, playbackManager);

                        setSongPlayer(songPlayer);
                        songPlayer.startPlayback();
                        await songPlayer.waitForSongToFinish();
                    } catch (e) {
                        console.error(e);
                        dispatch(addError(e as SongError))
                    } finally {
                        dispatch(stopPlayback())
                    }
                })();
            }
        } else {
            if (songPlayer) {
                songPlayer.stopPlayback()
                setSongPlayer(undefined);
            } else {
                console.log(`shouldn't happen`, isPlaying, playbackManager)
            }
        }
    }, [dispatch, documentValue, isPlaying, playbackManager]);

    return <PlaybackContext.Provider value={playbackManager}>
        {props.children}
    </PlaybackContext.Provider>
}