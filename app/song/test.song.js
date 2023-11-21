export default async function rootTrack(t) {
    const {_, loadInstrument, startTrack, wait} = t;
    _(t.currentInstrument = t.lead2, 23);
    _(t.waitTime = (1 / 4) / 1.5, 40);
    _(t.lead = loadInstrument(require("./instruments/oscillator"), {wait: (1 / 8) * 1.5}), 103);
    _(t.lead2 = loadInstrument(require("./instruments/oscillator"), {'type': 'square'}), 171);
    _(t.lead.config.type = 'pulse', 198);
    _(t.lead.config.pulseWidth = 0.5, 226);
    _(t.lead.config.envelop.mixer = 1, 255);
    _(t.lead2.config.type = 'square', 283);
    _(t.lead.config.envelop.mixer = 0.5, 314);
    _(t.wut = 'ohok', 328);
    _(t.omfg = '1230WUT2of', 347);
    _(t.rully = 'yup', 360);
    _(t.bpm = 120, 367);
    _(t.currentInstrument = t.lead, 390);
    _(startTrack(track1), 398);
    await _(wait(3 / 8), 402);
    _(t.currentInstrument = t.lead2, 426);
    _(startTrack(track1), 434);
    await _(wait(5 / 8), 438);
    await _(wait((3) / 1.5), 442);

}

async function track1(t) {
    const {playNote, _, wait} = t;

    _(playNote('C5', (1 / 4) * 1.5), 461);
    await _(wait(1 / 4), 466);
    _(playNote('C4', (1 / 4) * 1.5, 0.8), 479);
    await _(wait(1 / 4), 483);
    _(playNote('G4', 1 / 4), 490);
    await _(wait(1 / 4), 494);
    _(playNote('Eb4', (1 / 4) * 1.5, 0.8), 507);
    await _(wait(1 / 4), 511);
    _(playNote('Eb5', (1 / 4) / 1.5), 520);
    await _(wait(1 / 4), 524);
    _(playNote('F5', (1 / 4) / 1.5), 532);
    await _(wait(1 / 4), 536);
    _(playNote('Eb5', (1 / 4) / 1.5), 545);
    await _(wait(1 / 4), 549);
    _(playNote('D5', (1 / 4) / 1.5), 557);
    await _(wait(1 / 4), 561);
    _(playNote('C5', (1 / 4) * 1.5), 569);
    await _(wait(1 / 4), 573);
    _(playNote('C4', (1 / 4) * 1.5, 0.8), 585);
    await _(wait(1 / 4), 589);
    _(playNote('G4', 1 / 4), 596);
    await _(wait(1 / 4), 600);
    _(playNote('Eb4', (1 / 4) * 1.5, 0.8), 613);
    await _(wait(1 / 4), 617);
    _(playNote('D5', 1 / 4), 624);
    await _(wait(1 / 4), 628);
    _(playNote('C4', 1 / 4, .8), 638);
    await _(wait(1 / 4), 642);
    _(playNote('Bb4', 1 / 4), 650);
    await _(wait(1 / 4), 654);
}