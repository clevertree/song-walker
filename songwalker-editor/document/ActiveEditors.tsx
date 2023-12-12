import {useDispatch, useSelector} from "react-redux";
import React, {useEffect} from "react";
import {openActiveEditor} from "@songwalker-editor/document/documentActions";
import {ROOT_TRACK} from "@songwalker/tokens";
import {RootState} from "@songwalker-editor/types";
import SourceEditor from "@songwalker-editor/document/SourceEditor";

export function ActiveEditors() {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(openActiveEditor({trackName: ROOT_TRACK, mode: "full", cursorPosition: 0}))
        dispatch(openActiveEditor({trackName: 'track1', mode: "track", cursorPosition: 0}))
    }, [dispatch]);
    const {tokens, trackList, activeEditors} = useSelector((state: RootState) => state.document);
    console.log('ActiveEditors', activeEditors)
    return (
        <div>
            {activeEditors.map(activeEditor => {
                    const {trackName} = activeEditor;
                    const trackRange = trackList[trackName];
                    if (!trackRange)
                        throw new Error("Invalid track name: " + trackName + JSON.stringify(trackList))

                    return <SourceEditor key={activeEditor.trackName} tokenRange={trackRange}
                                         activeEditor={...activeEditor}/>
                }
            )}
        </div>
    )
}