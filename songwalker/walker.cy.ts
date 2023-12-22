import {getSongPlayer, InstrumentBank, InstrumentInstance, TrackRenderer} from "./walker";
import constants from "./constants";

describe('songPlayer', () => {
    let instrumentBank: InstrumentBank = {
        testInstrument
    }

    it('plays sub-tracks', async () => {
        const logCallback = cy.stub();
        const songInstance = getSongPlayer(testSong, {
            handleTrackEvent: logCallback
        });
        await songInstance.waitForSongToFinish();
        const status = songInstance.getRootTrackState();
        // @ts-ignore
        expect(status.instrument.callCount).to.eq(16)
        expect(logCallback.callCount).to.eq(16)
        expect(status.position).to.eq(4)
        expect(status.currentTime).to.eq(2.25)
    })

    it('playing a song without an instrument throws an error ', async () => {
        const songInstance = getSongPlayer(testSongNoInstrument);
        try {
            await songInstance.waitForSongToFinish();
            // noinspection ExceptionCaughtLocallyJS
            throw new Error("Song finished without error")
        } catch (e) {
            // @ts-ignore
            expect(e.message).to.eq(constants.ERR_NO_INSTRUMENT)
        }
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

    let tokenID = 1
    _(tokenID++);
    n("C5", (1 / 4));
    _(tokenID++);
    await w(1 / 4);
    _(tokenID++);
    n("C4", 1 / 4);
    _(tokenID++);
    await w(1 / 4);
    n("G4", 1 / 4);
    _(tokenID++);
    await w(1 / 4);
    n("Eb4", 1 / 4);
    _(tokenID++);
    await w(1 / 4);
    n("Eb5", 1 / 4);
    _(tokenID++);
    await w(1 / 4);
    _(tokenID++);
    n("F5", 1 / 4);
    await w(1 / 4);
    _(tokenID++);
    n("Eb5", 1 / 4);
    await w(1 / 4);
    _(tokenID++);
    n("D5", 1 / 4);
    await w(1 / 4);
    // n("C5", 1 / 4);
}