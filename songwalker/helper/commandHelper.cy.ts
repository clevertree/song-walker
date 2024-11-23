import {parseCommand, parseNote} from "./commandHelper";

describe('noteHelper', () => {
    it('parseNote C#4v0.5d1/2', async () => {
        const commandInfo = parseCommand('C#4^0.5@1/2');
        expect(commandInfo).to.deep.eq({
            "command": "C#4",
            "params": {
                "velocity": 0.5,
                "duration": 0.5
            }
        })
        const noteInfo = parseNote(commandInfo.command)
        expect(noteInfo).to.deep.eq({
            "note": "C#",
            "octave": 4,
            "frequency": 272.1429467772926,
        })
    })
    it('parseNote C#4v.5d/2', async () => {
        const commandInfo = parseCommand('C#q4^.5@/2');
        expect(commandInfo).to.deep.eq({
            "command": "C#q4",
            "params": {
                "velocity": 0.5,
                "duration": 0.5
            }
        })
        const noteInfo = parseNote(commandInfo.command)
        expect(noteInfo).to.deep.eq({
            "note": "C#q",
            "octave": 4,
            "frequency": 280.1173438046181,
        })
    })
})
