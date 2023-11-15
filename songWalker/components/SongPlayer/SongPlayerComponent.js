"use client"

import Image from "next/image";
import Song from '@/app/song/test.song'
import {startSong, stopAllPlayers} from "/songWalker/song/player.js";

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

function play() {
    console.log("Playing", Song)
    stopAllPlayers();
    startSong(Song);
}
