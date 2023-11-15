import {compiler, sourceToTokens} from './compiler'

describe('songLoader', () => {
    it('compiles to javascript', () => {
        cy.fixture('test.song').then((SONG_SOURCE) => {
            cy.fixture('test.song.compiled').then((SONG_SOURCE_COMPILED) => {
                const compiledSource = compiler(SONG_SOURCE);
                expect(compiledSource).to.eq(SONG_SOURCE_COMPILED)
                // const cmdList1 = compiledSource.split(' ');
                // const cmdList2 = SONG_SOURCE_COMPILED.split(' ');
                // for (let i = 0; i < cmdList1.length; i++) {
                //     expect(cmdList1[i].trim()).to.eq(cmdList2[i].trim())
                // }
            })
        })
    })


    it('compiles to tokens', () => {
        const SONG_SOURCE = `testFunction('arg');C5:1/4:.8;1/4`
        const compiledSource = sourceToTokens(SONG_SOURCE);
        expect(JSON.stringify(compiledSource)).to.deep.eq(JSON.stringify([
            {
                "type": "function-call",
                "content": "testFunction('arg');",
                "length": 20
            },
            {
                "type": "play-statement",
                "content": "C5:1/4:.8;",
                "length": 10
            },
            {
                "type": "wait-statement",
                "content": "1/4",
                "length": 3
            }
        ]))
    })
})


