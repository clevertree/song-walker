import {
    compileSongToCallback,
    compileSongToJavascript,
    EXPORT_JS,
    F_TRACK_PLAY,
    F_TRACK_WAIT,
    sourceToTokens
} from './compiler'
import {TrackState} from "@songwalker";
import {getDefaultSongFunctions, getDefaultTrackState} from "../helper/songHelper"

describe('compiler', () => {
    const emptyTemplate = (s: string) => s;
    it('play statement - C5@3/8^.2;', () => {
        const SONG_SOURCE = `C5@3/8^.2;`
        const compiledSource = sourceToTokens(SONG_SOURCE);
        expect(JSON.stringify(compiledSource)).to.deep.eq(JSON.stringify(
            [["command-statement", "C5@3/8^.2;"]]
        ))
        const javascriptContent = compileSongToJavascript(SONG_SOURCE, emptyTemplate);
        expect(javascriptContent).to.eq(`${F_TRACK_PLAY}('C5', {duration:3/8,velocity:.2});`)
    })

    it('wait statement - 1/6; /5', () => {
        const SONG_SOURCE = `1/6; /5`
        const compiledSource = sourceToTokens(SONG_SOURCE);
        expect(JSON.stringify(compiledSource)).to.deep.eq(JSON.stringify(
            [["wait-statement", "1/6;"], " ", ["wait-statement", "/5"]]
        ))
        const javascriptContent = compileSongToJavascript(SONG_SOURCE, emptyTemplate);
        expect(javascriptContent).to.eq(`await ${F_TRACK_WAIT}(1/6); await ${F_TRACK_WAIT}(1/5);`)
    })

    it('set track variable', () => {
        const SONG_SOURCE = `track.someVar = 'wutValue';track.someVar=1/7;track.someVar = track.otherVar;`
        const compiledSource = sourceToTokens(SONG_SOURCE);
        expect(JSON.stringify(compiledSource)).to.deep.eq(JSON.stringify(
            [
                ["variable-statement", "track.someVar = 'wutValue';"],
                ["variable-statement", "track.someVar=1/7;"],
                ["variable-statement", "track.someVar = track.otherVar;"]]
        ))
        const javascriptContent = compileSongToJavascript(SONG_SOURCE, emptyTemplate);
        expect(javascriptContent).to.eq("track.someVar = 'wutValue';track.someVar=1/7;track.someVar = track.otherVar;")
    })

    it('set const variable', () => {
        const SONG_SOURCE = `const someVar = wutVar;let otherVar=1/7;`
        const compiledSource = sourceToTokens(SONG_SOURCE);
        expect(JSON.stringify(compiledSource)).to.deep.eq(JSON.stringify(
            [
                ["variable-statement", "const someVar = wutVar;"],
                ["variable-statement", "let otherVar=1/7;"]
            ]
        ))
        const javascriptContent = compileSongToJavascript(SONG_SOURCE, emptyTemplate);
        expect(javascriptContent).to.eq("const someVar = wutVar;let otherVar=1/7;")
    })


    it('track declaration', () => {
        const SONG_SOURCE = `track myTrack() { C4^2 D4@2 }`
        const compiledSource = sourceToTokens(SONG_SOURCE);
        expect(JSON.stringify(compiledSource)).to.deep.eq(JSON.stringify(
            [["track-definition", "track myTrack() {"], " ", ["command-statement", "C4^2"], " ", ["command-statement", "D4@2"], " }"]
        ))
        const javascriptContent = compileSongToJavascript(SONG_SOURCE, emptyTemplate);
        expect(javascriptContent).to.eq(
            EXPORT_JS.trackDefinition("function myTrack() {")
            + " _tp('C4', {velocity:2}); _tp('D4', {duration:2}); }")

    })


    it('function', () => {
        const SONG_SOURCE = `testFunction('arg');`
        const compiledSource = sourceToTokens(SONG_SOURCE);
        expect(JSON.stringify(compiledSource)).to.eq(JSON.stringify(
            [["function-statement", "testFunction('arg');"]]
        ))
    })

    it('compiles to callback', () => {
        cy.fixture('test.song').then((SONG_SOURCE) => {
            cy.fixture('test.song.compiled').then((SONG_SOURCE_COMPILED) => {
                const javascriptContent = compileSongToJavascript(SONG_SOURCE);
                console.log(javascriptContent)
                const callback = compileSongToCallback(SONG_SOURCE);
                console.log('callback', callback);
                // expect(Object.values(tokens).length).to.eq(88);
                const cmdList1 = javascriptContent.split(/\s+/);
                const cmdList2 = SONG_SOURCE_COMPILED.split(/\s+/);
                for (let i = 0; i < cmdList1.length; i++) {
                    expect(cmdList1[i].trim()).to.eq(cmdList2[i].trim())
                }
                // expect(javascriptContent).to.eq(SONG_SOURCE_COMPILED)
            })
        })
    })


    it('executes song', () => {
        cy.fixture('test.song').then((SONG_SOURCE) => {
            const javascriptContent = compileSongToCallback(SONG_SOURCE);
            const context = new AudioContext();
            const trackState: TrackState = {
                ...getDefaultTrackState(context.destination),
            }
            cy.wrap(javascriptContent(trackState, getDefaultSongFunctions())).then(() => {
            });
        })
    })

    // it('compiles to javascript in event mode', () => {
    //     cy.fixture('test.song').then((SONG_SOURCE) => {
    //         cy.fixture('test.song.compiled').then((SONG_SOURCE_COMPILED) => {
    //             const {javascriptContent, tokens, trackTokenList} = compileSongToJavascript(SONG_SOURCE, {
    //                 // eventMode: true,
    //             });
    //             cy.log('javascriptContent', javascriptContent)
    //         })
    //     })
    // })
})


