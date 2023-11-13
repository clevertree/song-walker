import Instrument from "./instruments/oscillator";

export default async function DefaultTrack(track) {
    const {playNote: n, wait: w} = track;


    track.loadInstrument('lead', Instrument, {arg: 1 / 4, envelope: {mixer: 0.1, keyNote: "C4"}});
    track.setBeatsPerMinute(120)

    while (true) {
        track.startTrack(groupOne)
        await w(8);
    }


    async function groupOne(track) {
        const {playNote: n, wait: w} = track;

        track.setInstrument('lead')
        n("C5", (1 / 4) * 1.5);
        await w(1 / 4);
        n("C4", 1 / 4);
        await w(1 / 4);
        n("G4", 1 / 5);
        await w(1 / 4);
        n("Eb4", 1 / 4);
        await w(1 / 4);
        n("Eb5", (1 / 4) / 1.5);
        await w(1 / 4);
        n("F5", (1 / 4) / 1.5);
        await w(1 / 4);
        n("Eb5", (1 / 4) / 1.5);
        await w(1 / 4);
        n("D5", (1 / 4) / 1.5);
        await w(1 / 4);
        n("C5", (1 / 4) * 1.5);
        await w(1 / 4);
        n("C4", 1 / 4);
        await w(1 / 4);
        n("G4", 1 / 5);
        await w(1 / 4);
        n("Eb4", 1 / 4);
        await w(1 / 4);
        n("D5", 1 / 4);
        await w(1 / 4);
        n("C4", (1 / 4) / 1.5);
        await w(1 / 4);
        n("Bb4", 1 / 4);
        await w(1 / 4);


    }

    async function groupTwo2(track) {
        const {playNote: n, wait: w} = track;

        track.setInstrument('lead')
        n("C5", (1 / 4) * 1.5);
        await w(1 / 4);
        n("C4", 1 / 4);
        await w(1 / 4);
        n("G4", 1 / 5);
        await w(1 / 4);
        n("Eb4", 1 / 4);
        await w(1 / 4);
        n("Eb5", (1 / 4) / 1.5);
        await w(1 / 4);
        n("F5", (1 / 4) / 1.5);
        await w(1 / 4);
        n("Eb5", (1 / 4) / 1.5);
        await w(1 / 4);
        n("D5", (1 / 4) / 1.5);
        await w(1 / 4);
        n("C5", (1 / 4) * 1.5);
        await w(1 / 4);
        n("C4", 1 / 4);
        await w(1 / 4);
        n("G4", 1 / 5);
        await w(1 / 4);
        n("Eb4", 1 / 4);
        await w(1 / 4);
        n("D5", 1 / 4);
        await w(1 / 4);
        n("C4", (1 / 4) / 1.5);
        await w(1 / 4);
        n("Bb4", 1 / 4);
        await w(1 / 4);
    }
}
