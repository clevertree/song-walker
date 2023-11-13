import songCompiler from './compiler'

describe('songLoader', () => {
    it('compiles', () => {
        cy.fixture('song.asource').then((SONG_SOURCE) => {
            cy.fixture('song.compiled').then((SONG_SOURCE_COMPILED) => {
                const compiledSource = songCompiler(SONG_SOURCE);
                cy.log(compiledSource)

                expect(compiledSource).to.eq(SONG_SOURCE_COMPILED)
            })
        })
    })
})


