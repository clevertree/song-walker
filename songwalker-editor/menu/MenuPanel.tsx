import React from "react";
import {useDispatch, useSelector} from "react-redux";
import styles from "./MenuPanel.module.scss";
import {RootState} from "../types";
import {startPlayback, stopPlayback} from "../document/documentActions";

function MenuPanel({}) {
    const dispatch = useDispatch();

    const isPlaying = useSelector((state: RootState) => state.document.isPlaying);
    const hasError = useSelector((state: RootState) => state.document.errors);

    return (
        <div className={styles.menuPanel}>
            <button disabled={isPlaying} className={hasError ? styles.buttonError : ''}
                    onClick={() => dispatch(startPlayback())}>Play
            </button>
            <button disabled={!isPlaying} onClick={() => dispatch(stopPlayback())}>Stop</button>
        </div>
    )
}

export default MenuPanel