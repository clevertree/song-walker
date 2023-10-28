const Instrument = require("./instruments/oscillator");
export default async function (track) {
    const {playNote: n, wait: w} = track;


    track.loadInstrument('lead', Instrument, {arg: 1, envelope: {mixer: 0.1, keyNote: "C4"}});
    track.setBeatsPerMinute(160);

    while (true) {
        track.startGroup(groupOne)
        await w("8B");
    }


    async function groupOne(track) {
        const {playNote: n, wait: w} = track;

        track.setInstrument('lead');
        n("C5", .9);
        await w(".5B");
        n("C4", .4);
        await w(".5B");
        n("G4", .9);
        await w(".5B");
        n("Eb4", .4);
        await w(".5B");
        n("Eb5", .4);
        await w(".5B");
        n("F5", .4);
        await w(".5B");
        n("Eb5", .4);
        await w(".5B");
        n("D5", .4);
        await w(".5B");
        n("C5", .9);
        await w(".5B");
        n("C4", .4);
        await w(".5B");
        n("G4", .9);
        await w(".5B");
        n("Eb4", .4);
        await w(".5B");
        n("D5", 1);
        await w(".5B");
        n("C4", .4);
        await w(".5B");
        n("Bb4", 1);
        await w("1B");
    }
}