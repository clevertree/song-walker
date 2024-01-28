import Preset from "./";

describe(Preset.title, () => {
    it('compiles', async () => {
        const instrumentPreset = Preset.getPreset('');
        expect(instrumentPreset).to.be.an('object');
        cy.log(instrumentPreset);
    })
})