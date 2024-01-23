import {SongPlayer,} from "@songwalker/walker";
import {HandlesTrackEvents, SongHandler, SongTrackEvent, TrackEventHandler} from "@songwalker/types";
import {compileSongToCallback} from "@songwalker/compiler";
import {loadSongAssets} from "@songwalker/songLoader";

export class PlaybackManager implements HandlesTrackEvents {

    private activeSong: SongHandler | null = null;
    private trackEventHandlers: {
        [trackName: string]: Array<TrackEventHandler>
    } = {};

    isPlaying() {
        return this.activeSong && this.activeSong.isPlaying();
    }


    stopAllPlayback() {
        if (!this.activeSong)
            throw new Error("Song is not playing");
        this.activeSong.stopPlayback();
        this.activeSong = null;
    }

    loadSong(songSource: string) {
        const callback = compileSongToCallback(songSource)
        this.activeSong = new SongPlayer(callback, this);
        loadSongAssets(callback);
        return this.activeSong;
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

