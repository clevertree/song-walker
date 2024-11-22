import {parseFrequencyString, parseNote} from "@songwalker/helper/noteHelper";

describe('noteHelper', () => {
    it('parseNote', async () => {
        const parts = parseNote('C#4v0.5d1/2');
        expect(parts).to.eq({})
    })
})
