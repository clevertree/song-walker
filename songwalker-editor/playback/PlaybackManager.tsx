import {compileToSongPlayer,} from "@songwalker/walker";
import {HandlesTrackEvents, SongHandler, SongTrackEvent, TrackEventHandler} from "@songwalker/types";

export class PlaybackManager implements HandlesTrackEvents {

    private activeSong: SongHandler | null = null;
    private trackEventHandlers: {
        [trackName: string]: Array<TrackEventHandler>
    } = {};

    isPlaying() {
        return !!this.activeSong;
    }

    stopAllPlayback() {
        if (!this.activeSong)
            throw new Error("Song is not playing");
        this.activeSong.stopPlayback();
        this.activeSong = null;
    }

    compile(songSource: string) {
        return this.activeSong = compileToSongPlayer(songSource, this);
    }

    addTrackEventHandler(trackName: string, callback: TrackEventHandler) {
        if (!this.trackEventHandlers[trackName])
            this.trackEventHandlers[trackName] = [];
        this.trackEventHandlers[trackName].push(callback)
    }

    handleTrackEvent(trackName: string, trackEvent: SongTrackEvent, tokenID: number): void {
        const eventHandlers = this.trackEventHandlers[trackName];
        if (eventHandlers) {
            for (const eventHandler of eventHandlers) {
                eventHandler(trackEvent, tokenID)
            }
        }
    }

}

