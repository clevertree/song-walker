"use client"

import Image from "next/image";
import Song from '@/app/song/song.song'
import player from "@/app/lib/player";
import {useEffect} from "react";

export default function SongPlayer() {
    useEffect(() => {
        console.log("Playing", Song)
        play();
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

function play() {
    player(Song);
}
