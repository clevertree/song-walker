// noinspection DuplicatedCode

import {parseCommandValues, TrackState} from "@songwalker";
import {getDefaultSongFunctions} from "@songwalker/helper/songHelper";

export function generateRandomBuffer(context: AudioContext) {
    const src = context.createBuffer(1, 8192, 44100);
    const audioBufferArray = src.getChannelData(0);
    for (let i = 0; i < 8192; i++) {
        audioBufferArray[i] = Math.sin((i % 168) / 168.0 * Math.PI * 2);
    }
    return src;
}

export function testWait(this: TrackState, duration: number) {
    this.currentTime += (duration) * (60 / this.beatsPerMinute);
}

/** @deprecated **/
export function testPlayCommand(this: TrackState, commandString: string) {
    const commandInfo = parseCommandValues(commandString);
    this.instrument.bind(this)({...this, ...commandInfo.params, command: commandInfo.command})
}

export function testCommands(track: TrackState) {
    const DefaultSongFunctions = getDefaultSongFunctions()
    return {
        wait: DefaultSongFunctions.wait.bind(track),
        waitAsync: DefaultSongFunctions.waitAsync.bind(track),
        playCommand: DefaultSongFunctions.playCommand.bind(track),
        parseAndPlayCommand: DefaultSongFunctions.parseAndPlayCommand.bind(track),
    }
}
