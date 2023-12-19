import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import styles from "@songwalker-editor/SongEditorComponent.module.scss";
import {RootState} from "@songwalker-editor/types";
import {startPlayback, stopPlayback} from "./menuActions";
import {SongHandler, walkSong} from "@songwalker/walker";
import {compileSongToCallback} from "@songwalker/compiler";

function MenuPanel({}) {
    const dispatch = useDispatch();

    const isPlaying = useSelector((state: RootState) => state.menu.isPlaying);
    const documentValue = useSelector((state: RootState) => state.document.value);
    const [songInstance, setSongInstance] = useState<SongHandler>();
    const playSong = useCallback(() => {
        console.log("processing and playing song")
        const callback = compileSongToCallback(documentValue)

        const songInstance = walkSong(callback);
        // songInstance.addEventCallback(logCallback)
        setSongInstance(songInstance);
        return songInstance;

    }, [documentValue])
    console.log('isPlaying', isPlaying, playSong);
    useEffect(() => {
        if (isPlaying) {
            if (!songInstance) {
                playSong()
            }
        } else {
            if (songInstance) {
                songInstance.stopPlayback
            }
        }
    }, [documentValue, isPlaying, playSong, songInstance]);


    return (
        <div className={styles.menuContainer}>
            <button disabled={isPlaying} onClick={() => dispatch(startPlayback())}>Play</button>
            <button disabled={!isPlaying} onClick={() => dispatch(stopPlayback())}>Stop</button>
        </div>
    )
}

export default MenuPanel