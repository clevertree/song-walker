import {parseNote} from "@songwalker/helper/noteHelper";

describe('noteHelper', () => {
    it('parseNote C#4v0.5d1/2', async () => {
        const parts = parseNote('C#4v0.5d1/2');
        expect(parts).to.deep.eq({
            "note": "C#",
            "octave": 4,
            "frequency": 272.1429467772926,
            "params": {
                "velocity": 0.5,
                "duration": 0.5
            }
        })
    })
    it('parseNote C#4v.5d/2', async () => {
        const parts = parseNote('C#q4v.5d/2');
        expect(parts).to.deep.eq({
            "note": "C#q",
            "octave": 4,
            "frequency": 280.1173438046181,
            "params": {
                "velocity": 0.5,
                "duration": 0.5
            }
        })
    })
})
