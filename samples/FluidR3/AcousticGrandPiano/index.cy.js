import Preset from "./";

describe(Preset.name, () => {
    it('compiles', async () => {
        const kit = Preset();
        // @ts-ignore
        cy.log(kit);
    })
})