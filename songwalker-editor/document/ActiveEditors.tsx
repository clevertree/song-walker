import {useDispatch, useSelector} from "react-redux";
import React, {useEffect, useMemo} from "react";
import {openActiveEditor} from "@songwalker-editor/document/documentActions";
import {ROOT_TRACK, sourceToTokens} from "@songwalker/tokens";
import {TrackRanges} from "@songwalker/types";
import {RootState} from "@songwalker-editor/types";
import SourceEditor from "@songwalker-editor/document/SourceEditor";
import {parseTrackList} from "@songwalker/compiler";

export function ActiveEditors() {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(openActiveEditor({trackName: ROOT_TRACK, mode: "full"}))
        dispatch(openActiveEditor({trackName: 'track1', mode: "track"}))
    }, [dispatch]);
    const {value, activeEditors} = useSelector((state: RootState) => state.document);
    const trackRanges = useMemo<TrackRanges>(() => {
        const tokens = sourceToTokens(value);
        console.log("ActiveEditors parsing tokens", tokens);
        return parseTrackList(tokens)
    }, [value])
    console.log('ActiveEditors', activeEditors, trackRanges, value)
    return (
        <div>
            {activeEditors.map(activeEditor => {
                    const {trackName} = activeEditor;
                    const trackRange = trackRanges[trackName];
                    if (!trackRange)
                        throw new Error("Invalid track name: " + trackName + JSON.stringify(trackRanges))

                    const trackInitialValue = value.substring(trackRange.offsetStart, trackRange.offsetEnd)
                    return <SourceEditor key={activeEditor.trackName}
                                         trackInitialValue={trackInitialValue}
                                         trackRange={trackRange}
                                         activeEditor={activeEditor}/>
                }
            )}
        </div>
    )
}