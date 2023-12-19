import {compileSongToJavascript, parseTrackList} from './compiler'
import {sourceToTokens} from "./tokens";

describe('songLoader', () => {
    it('compiles to javascript', () => {
        cy.fixture('test.song').then((SONG_SOURCE) => {
            cy.fixture('test.song.compiled').then((SONG_SOURCE_COMPILED) => {
                const trackList = parseTrackList(SONG_SOURCE)
                expect(Object.values(trackList).length).to.eq(2);
                const javascriptContent = compileSongToJavascript(SONG_SOURCE);
                // expect(Object.values(tokens).length).to.eq(88);
                const cmdList1 = javascriptContent.split(/\s+/);
                const cmdList2 = SONG_SOURCE_COMPILED.split(/\s+/);
                for (let i = 0; i < cmdList1.length; i++) {
                    expect(cmdList1[i].trim()).to.eq(cmdList2[i].trim())
                }
                expect(javascriptContent).to.eq(SONG_SOURCE_COMPILED)
            })
        })
    })

    it('compiles to javascript in event mode', () => {
        cy.fixture('test.song').then((SONG_SOURCE) => {
            cy.fixture('test.song.compiled').then((SONG_SOURCE_COMPILED) => {
                const {javascriptContent, tokens, trackTokenList} = compileSongToJavascript(SONG_SOURCE, {
                    eventMode: true,
                });
                cy.log('javascriptContent', javascriptContent)
            })
        })
    })


    it('wait statement compiles to tokens', () => {
        const SONG_SOURCE = `1/4T;`
        const compiledSource = sourceToTokens(SONG_SOURCE);
        expect(JSON.stringify(compiledSource)).to.deep.eq(JSON.stringify(
            [{
                "type": "wait-statement",
                "content": [
                    {"type": "param-numeric", "content": "1/4"},
                    {"type": "param-factor", "content": "T"},
                    ";"]
            }]
        ))
    })

    it('function compiles to tokens', () => {
        const SONG_SOURCE = `testFunction('arg');`
        const compiledSource = sourceToTokens(SONG_SOURCE);
        expect(JSON.stringify(compiledSource)).to.eq(JSON.stringify(
            [{
                "type": "function-statement",
                "content": [{"type": "function-name", "content": "testFunction"}, "(", {
                    "type": "param-string",
                    "content": "'arg'"
                }, ");"]
            }]
        ))
    })
})


