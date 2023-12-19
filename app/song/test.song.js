export default async function rootTrack(t) {
    const {require, loadInstrument, startTrack, wait} = t;
    t.lead = loadInstrument(require("oscillator"), {});
    t.lead2 = loadInstrument(require("oscillator"), {type: 'square'});
    t.lead.config.type = 'pulse';
    t.lead.config.pulseWidth = 0.5;
    t.lead.config.envelop.mixer = 1;
    t.lead2.config.type = 'square';
    t.lead.config.envelop.mixer = 0.5;
    t.wut = 'ohok';
    t.omfg = '1230WUT2of';
    t.rully = 'yup';
    t.bpm = 120;
    t.inst = t.lead;
    startTrack(track1);
    await wait(3 / 8);
    t.inst = t.lead2;
    startTrack(track1);
    await wait(5 / 8);
    await wait((3) / 1.5);

}

async function track1(t) {
    const {playFrequency, wait} = t;

    playFrequency('C5', (1 / 4) * 1.5);
    await wait(1 / 4);
    playFrequency('C4', (1 / 4) * 1.5, 0.8);
    await wait(1 / 4);
    playFrequency('G4', 1 / 4);
    await wait(1 / 4);
    playFrequency('Eb4', (1 / 4) * 1.5, 0.8);
    await wait(1 / 4);
    playFrequency('Eb5', (1 / 4) / 1.5);
    await wait(1 / 4);
    playFrequency('F5', (1 / 4) / 1.5);
    await wait(1 / 4);
    playFrequency('Eb5', (1 / 4) / 1.5);
    await wait(1 / 4);
    playFrequency('D5', (1 / 4) / 1.5);
    await wait(1 / 4);
    playFrequency('C5', (1 / 4) * 1.5);
    await wait(1 / 4);
    playFrequency('C4', (1 / 4) * 1.5, 0.8);
    await wait(1 / 4);
    playFrequency('G4', 1 / 4);
    await wait(1 / 4);
    playFrequency('Eb4', (1 / 4) * 1.5, 0.8);
    await wait(1 / 4);
    playFrequency('D5', 1 / 4);
    await wait(1 / 4);
    playFrequency('C4', 1 / 4, .8);
    await wait(1 / 4);
    playFrequency('Bb4', 1 / 4);
    await wait(1 / 4);

}
