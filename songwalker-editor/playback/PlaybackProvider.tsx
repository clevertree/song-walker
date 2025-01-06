import React, {useEffect, useMemo, useState} from "react";
import {PlaybackManager} from "@songwalker-editor/playback/PlaybackManager";
import {EditorState} from "@songwalker-editor/types";
import {PlaybackContext} from "./PlaybackContext";
import {compileSongToCallback} from "@songwalker/compiler";
import {loadSongAssets} from "@songwalker/songLoader";
import {SongWalker} from "@songwalker/walker";

interface PlaybackProviderProps {
    children: string | React.JSX.Element | React.JSX.Element[]
}

export function PlaybackProvider(props: PlaybackProviderProps) {
    const dispatch = useDispatch();
    const playbackManager = useMemo<PlaybackManager>(() => new PlaybackManager(), [])
    const isPlaying = useSelector((state: EditorState) => state.document.isPlaying);
    const documentValue = useSelector((state: EditorState) => state.document.value);
    const [songPlayer, setSongPlayer] = useState<SongHandler>()

    useEffect(() => {
        const callback = compileSongToCallback(documentValue)
        loadSongAssets(callback);
        // TODO: show loading of assets
    });

    useEffect(() => {
        if (isPlaying) {
            if (!songPlayer) {
                (async () => {
                    try {
                        const callback = compileSongToCallback(documentValue)
                        const songPlayer = new SongWalker(callback, playbackManager);

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
            }
        }
    }, [dispatch, documentValue, isPlaying, playbackManager]);

    return <PlaybackContext.Provider value={playbackManager}>
        {props.children}
    </PlaybackContext.Provider>
}
