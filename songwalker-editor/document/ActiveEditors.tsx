import {useSelector} from "react-redux";
import React, {useMemo} from "react";
import {TrackSourceMap} from "@songwalker/types";
import {RootState} from "@songwalker-editor/types";
import SourceEditor from "@songwalker-editor/document/SourceEditor";
import {parseTrackList} from "@songwalker/compiler";

export function ActiveEditors() {
    const {value, activeEditors} = useSelector((state: RootState) => state.document);
    const trackList = useMemo<TrackSourceMap>(() => {
        const trackList = parseTrackList(value);
        // console.log("ActiveEditors parsing tokens", trackList);
        return trackList
    }, [value])

    return (
        <div>
            {Object.keys(trackList).map(trackName => {
                    if (activeEditors.hasOwnProperty(trackName) && !activeEditors[trackName])
                        return null;

                    const trackInitialValue = trackList[trackName]
                    return <SourceEditor key={trackName}
                                         trackName={trackName}
                                         trackValue={trackInitialValue}/>
                }
            )}
        </div>
    )
}