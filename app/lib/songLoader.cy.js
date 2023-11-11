import convertToJavascript from './songLoader'

describe('songLoader', () => {
    it('compiles', () => {
        cy.fixture('song.song').then((SONG_SOURCE) => {
            cy.fixture('song.compiled').then((SONG_SOURCE_COMPILED) => {
                const compiledSource = convertToJavascript(SONG_SOURCE);
                cy.log(compiledSource)

                expect(compiledSource).to.eq(SONG_SOURCE_COMPILED)
            })
        })
    })
})


