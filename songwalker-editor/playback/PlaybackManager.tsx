import {compileAndWalk, SongHandler, TrackCallback, walkSong} from "@songwalker/walker";

export class PlaybackManager {
    private activeSongs: Array<SongHandler> = [];

    constructor() {

    }

    isPlaying() {
        return this.activeSongs.length > 0;
    }

    stopAllPlayback() {
        for (const activeSong of this.activeSongs) {
            activeSong.stopPlayback();
        }
        this.activeSongs = [];
    }

    compileAndPlay(songSource: string) {
        const activeSong = compileAndWalk(songSource);
        this.activeSongs.push(activeSong)
        activeSong.waitForSongToFinish().then(() => {
            const pos = this.activeSongs.indexOf(activeSong);
            if (pos === -1)
                throw new Error("Active song not found");
            this.activeSongs.splice(pos, 1);
            console.log("Removing song", this.activeSongs)
        })
        return activeSong;
    }

    walkSong(songCallback: TrackCallback) {
        this.activeSongs.push(walkSong(songCallback))

    }


}