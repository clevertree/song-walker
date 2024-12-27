// noinspection DuplicatedCode

import {parseCommandValues, TrackState} from "@songwalker";


export function testWait(track: TrackState, duration: number) {
    this.currentTime += (duration) * (60 / this.beatsPerMinute);
}

export function testPlayCommand(track: TrackState, commandString: string) {
    const commandInfo = parseCommandValues(commandString);
    this.instrument(track, {...this, ...commandInfo.params, command: commandInfo.command})
}

export function testCommands(trackState: TrackState) {
    return {
        wait: testWait.bind(trackState),
        playCommand: testPlayCommand.bind(trackState),
    }
}
