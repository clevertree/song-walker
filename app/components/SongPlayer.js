"use client"

import Image from "next/image";
import Song from '@/app/song/song.song'
import {startSong, stopAllPlayers} from "@/app/lib/songPlayer";
import {useEffect} from "react";

export default function SongPlayer() {
    useEffect(() => {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
            play();
        }, 300)
    }, []);
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
