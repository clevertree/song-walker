import {compiler} from './compiler'
import {sourceToTokens} from "./tokens";

describe('songLoader', () => {
    it('compiles to javascript', () => {
        cy.fixture('test.song').then((SONG_SOURCE) => {
            cy.fixture('test.song.compiled').then((SONG_SOURCE_COMPILED) => {
                const [scriptContent, tokens, trackList] = compiler(SONG_SOURCE);
                expect(Object.values(trackList).length).to.eq(2);
                expect(Object.values(tokens).length).to.eq(98);
                const cmdList1 = scriptContent.split(/\s+/);
                const cmdList2 = SONG_SOURCE_COMPILED.split(/\s+/);
                for (let i = 0; i < cmdList1.length; i++) {
                    expect(cmdList1[i].trim()).to.eq(cmdList2[i].trim())
                }
                // expect(compiledSource).to.eq(SONG_SOURCE_COMPILED)
            })
        })
    })

    it('compiles to javascript in event mode', () => {
        cy.fixture('test.song').then((SONG_SOURCE) => {
            cy.fixture('test.song.compiled').then((SONG_SOURCE_COMPILED) => {
                const [scriptContent, tokens, trackList] = compiler(SONG_SOURCE, {
                    eventMode: true,
                    exportStatement: 'module.exports='
                });
                cy.log('scriptContent')
            })
        })
    })


    it('wait statement compiles to tokens', () => {
        const SONG_SOURCE = `1/4T;`
        const compiledSource = sourceToTokens(SONG_SOURCE);
        expect(JSON.stringify(compiledSource)).to.deep.eq(JSON.stringify(
            [{
                "type": "wait-statement",
                "content": [{"type": "numeric", "content": "1/4", "length": 3}, {
                    "type": "factor",
                    "content": "T",
                    "length": 1
                }, {"type": "punctuation", "content": ";", "length": 1}],
                "length": 5
            }]
        ))
    })

    it('function compiles to tokens', () => {
        const SONG_SOURCE = `testFunction('arg');`
        const compiledSource = sourceToTokens(SONG_SOURCE);
        expect(JSON.stringify(compiledSource)).to.eq(JSON.stringify(
            [{
                "type": "function-statement",
                "content": [{"type": "function-name", "content": "testFunction", "length": 12}, {
                    "type": "punctuation",
                    "content": "(",
                    "length": 1
                }, {"type": "param-string", "content": "'arg'", "length": 5}, {
                    "type": "punctuation",
                    "content": ")",
                    "length": 1
                }, {"type": "punctuation", "content": ";", "length": 1}],
                "length": 20
            }]
        ))
    })
})


