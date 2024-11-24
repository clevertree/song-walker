import {compileSongToJavascript, parseTrackList} from './compiler'
import {sourceToTokens} from "./tokens";

describe('compiler', () => {
    it('play statement compiles to tokens - C5@3/8^.2;', () => {
        const SONG_SOURCE = `C5@3/8^.2;`
        const compiledSource = sourceToTokens(SONG_SOURCE);
        expect(JSON.stringify(compiledSource)).to.deep.eq(JSON.stringify(
            [["command-statement", [
                ["command", "C5"],
                ["param", [["symbol", "@"], ["value", "3/8"]]],
                ["param", [["symbol", "^"], ["value", ".2"]]],
                ';'
            ]]]
        ))
        const javascriptContent = compileSongToJavascript(SONG_SOURCE);
        expect(javascriptContent).to.eq("ts.instrument(ts, 'C5', {noteDuration:3/8, noteVelocity:.2});")
    })

    it('wait statement compiles to tokens - 1/6;', () => {
        const SONG_SOURCE = `1/6;`
        const compiledSource = sourceToTokens(SONG_SOURCE);
        expect(JSON.stringify(compiledSource)).to.deep.eq(JSON.stringify(
            [["wait-statement", [
                ["duration", "1/6"],
                ";"
            ]]]
        ))
        const javascriptContent = compileSongToJavascript(SONG_SOURCE);
        expect(javascriptContent).to.eq("await wait(ts, 1/6);")
    })

    it('set track variable compiles to tokens', () => {
        const SONG_SOURCE = `someVar = 'wutValue';`
        const compiledSource = sourceToTokens(SONG_SOURCE);
        expect(JSON.stringify(compiledSource)).to.deep.eq(JSON.stringify(
            [["variable-statement", [
                ["assign-to-variable", "someVar"],
                " = ",
                ["param-string", "'wutValue'"],
                ";"
            ]]]
        ))
        const javascriptContent = compileSongToJavascript(SONG_SOURCE);
        expect(javascriptContent).to.eq("ts.someVar='wutValue';")
    })

    it('set const variable compiles to tokens', () => {
        const SONG_SOURCE = `const someVar = wutVar;`
        const compiledSource = sourceToTokens(SONG_SOURCE);
        expect(JSON.stringify(compiledSource)).to.deep.eq(JSON.stringify(
            [["variable-statement", [
                ["assign-to-variable", "someVar"],
                " = ",
                ["param-variable", "wutVar"],
                ";"
            ]]]
        ))
        const javascriptContent = compileSongToJavascript(SONG_SOURCE);
        expect(javascriptContent).to.eq("await wait(ts, 1/6);")
    })


    it('compiles to javascript', () => {
        cy.fixture('test.song').then((SONG_SOURCE) => {
            cy.fixture('test.song.compiled').then((SONG_SOURCE_COMPILED) => {
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


