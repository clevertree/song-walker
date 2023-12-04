"use client"

import Image from "next/image";
import Song from '@/app/song/test.song'
import {walkSong} from "/songWalker/song/walker";

export default function SongPlayerComponent() {
    // useEffect(() => {
    //     window.clearTimeout(timeout);
    //     timeout = window.setTimeout(() => {
    //         play();
    //     }, 300)
    // }, []);
    return <button
        onClick={play}
    >
        <Image
            src="/vercel.svg"
            alt="Vercel Logo"
            className="dark:invert"
            width={100}
            height={24}
            priority
        />
    </button>
}

let timeout;

let recentSongHandler = null;

function play() {
    console.log("Playing", Song)
    // stopAllPlayers();
    if (recentSongHandler)
        recentSongHandler.stopPlayback();
    recentSongHandler = walkSong(Song);

}
