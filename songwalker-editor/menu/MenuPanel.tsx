import React, {useEffect, useState} from "react";
import {TrackCallback, TrackRenderer} from "@songwalker/song/walker";
import {useDispatch, useSelector} from "react-redux";
import styles from "@songwalker-editor/SongEditorComponent.module.scss";
import {startPlayback, stopPlayback} from "@songwalker-editor/menu/menuActions";
import {RootState} from "@songwalker-editor/types";

export default function MenuPanel({}) {
    const dispatch = useDispatch();

    const isPlaying = useSelector((state: RootState) => state.menu.isPlaying);
    const [songCallback, setSongCallback] = useState<TrackCallback | null>(null)
    console.log('isPlaying', isPlaying, songCallback);
    useEffect(() => {
        if (isPlaying && !songCallback) {
            console.log("TODO: setSongCallback")
            const callback: TrackCallback = function (trackRenderer: TrackRenderer) {
            }
            console.log('callback', callback)
            setSongCallback(callback)
        }
    }, [isPlaying, songCallback]);


    return (
        <div className={styles.menuContainer}>
            <button disabled={isPlaying} onClick={() => dispatch(startPlayback())}>Play</button>
            <button disabled={!isPlaying} onClick={() => dispatch(stopPlayback())}>Stop</button>
        </div>
    )
}