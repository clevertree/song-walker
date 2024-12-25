// noinspection DuplicatedCode

import {parseCommandValues, TrackState} from "@songwalker";


export function testWait(this: TrackState, duration: number) {
    this.currentTime += (duration) * (60 / this.beatsPerMinute);
}

export function testPlayCommand(this: TrackState, commandString: string) {
    const commandInfo = parseCommandValues(commandString);
    this.instrument.bind(this)({...this, ...commandInfo.params, command: commandInfo.command})
}

export function testCommands(trackState: TrackState) {
    return {
        wait: testWait.bind(trackState),
        playCommand: testPlayCommand.bind(trackState),
    }
}
