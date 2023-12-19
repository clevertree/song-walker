import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import styles from "@songwalker-editor/SongEditorComponent.module.scss";
import {RootState} from "@songwalker-editor/types";
import {startPlayback, stopPlayback} from "./menuActions";
import {compileSongToJavascript} from "@songwalker/compiler";
import {SongHandler, walkSong} from "@songwalker/walker";

function MenuPanel({}) {
    const dispatch = useDispatch();

    const isPlaying = useSelector((state: RootState) => state.menu.isPlaying);
    const documentValue = useSelector((state: RootState) => state.document.value);
    const [songInstance, setSongInstance] = useState<SongHandler>();
    const playSong = useCallback(() => {
        console.log("processing and playing song")
        const callback = compileToCallback(documentValue)

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

function compileToCallback(songSource: string) {
    const javascriptSource = compileSongToJavascript(songSource, true)
    const callback = eval(javascriptSource);

    function require(path) {
        throw new Error("TODO: " + path)
    }

    console.log('callback', callback)
    return callback;
}

export default MenuPanel