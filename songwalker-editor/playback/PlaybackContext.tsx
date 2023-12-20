import {createContext} from "react";
import {SongHandler} from "@songwalker/walker";

export const PlaybackContext = createContext<SongHandler | null>(null)

