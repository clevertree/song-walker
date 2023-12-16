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
    const trackList = useMemo<TrackRanges>(() => {
        const tokens = sourceToTokens(value);
        console.log("ActiveEditors parsing tokens", tokens);
        return parseTrackList(tokens)
    }, [value])
    console.log('ActiveEditors', activeEditors, trackList, value)
    return (
        <div>
            {activeEditors.map(activeEditor => {
                    const {trackName} = activeEditor;
                    const trackRange = trackList[trackName];
                    if (!trackRange)
                        throw new Error("Invalid track name: " + trackName + JSON.stringify(trackList))

                    const trackInitialValue = value.substring(trackRange.start, trackRange.end)
                    console.log('trackInitialValue', trackInitialValue, trackRange.start, trackRange.end)
                    return <SourceEditor key={activeEditor.trackName}
                                         trackInitialValue={trackInitialValue}
                                         tokenRange={trackRange}
                                         activeEditor={activeEditor}/>
                }
            )}
        </div>
    )
}