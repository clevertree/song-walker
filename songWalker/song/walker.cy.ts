import {InstrumentInstance, TrackRenderer, walkSong} from "./walker";
import {registerInstrument} from "./instruments"
import constants from "./constants";

describe('songPlayer', () => {
    beforeEach(() => {
        registerInstrument('testInstrument', testInstrument)
    })

    it('plays sub-tracks', async () => {
        const logCallback = cy.stub();
        const songInstance = walkSong(testSong);
        songInstance.addEventCallback(logCallback)
        await songInstance.waitForSongToFinish();
        const status = songInstance.getRootTrackState();
        expect(status.instrument.callCount).to.eq(16)
        expect(logCallback.callCount).to.eq(16)
        expect(status.position).to.eq(4)
        expect(status.currentTime).to.eq(2.25)
    })

    it('playing a song without an instrument throws an error ', async () => {
        const songInstance = walkSong(testSongNoInstrument);
        try {
            await songInstance.waitForSongToFinish();
            // noinspection ExceptionCaughtLocallyJS
            throw new Error("Song finished without error")
        } catch (e) {
            expect(e.message).to.eq(constants.ERR_NO_INSTRUMENT)
        }
        // @ts-ignore
    })
})

function testInstrument(config: object): InstrumentInstance {
    return cy.stub()
}


async function testSong(trackRenderer: TrackRenderer) {
    const {wait: w, loadInstrument} = trackRenderer;
    await loadInstrument(testInstrument)
    trackRenderer.setVariable('beatsPerMinute', 160)
    trackRenderer.startTrack(testTrack)
    await w(2);
    trackRenderer.setVariable('beatsPerMinute', 80)
    trackRenderer.startTrack(testTrack)
    await w(2);
}

async function testSongNoInstrument(trackRenderer: TrackRenderer) {
    trackRenderer.startTrack(testTrack)
}

async function testTrack(trackRenderer: TrackRenderer) {
    const {playNote: n, wait: w, setCurrentToken: _} = trackRenderer;

    _(1);
    n("C5", (1 / 4));
    await w(1 / 4);
    n("C4", 1 / 4);
    await w(1 / 4);
    n("G4", 1 / 4);
    await w(1 / 4);
    n("Eb4", 1 / 4);
    await w(1 / 4);
    n("Eb5", 1 / 4);
    await w(1 / 4);
    n("F5", 1 / 4);
    await w(1 / 4);
    n("Eb5", 1 / 4);
    await w(1 / 4);
    n("D5", 1 / 4);
    await w(1 / 4);
    // n("C5", 1 / 4);
}