import {getSongPlayer} from "./walker";
import {ERRORS} from "./constants";
import {InstrumentInstance, TrackRenderer} from "@songwalker/types";

describe('songPlayer', () => {
    it('plays sub-tracks', async () => {
        const logCallback = cy.stub();
        const songInstance = getSongPlayer(testSong, {
            handleTrackEvent: logCallback
        });
        songInstance.startPlayback();
        await songInstance.waitForSongToFinish();
        const status = songInstance.getRootTrackState();
        expect(logCallback.callCount).to.eq(37)
        expect(status.position).to.eq(4)
        expect(status.currentTime).to.eq(2.25)
    })

    it('plays percussion track', async () => {
        const logCallback = cy.stub();
        const songInstance = getSongPlayer(testTrackPercussion, {
            handleTrackEvent: logCallback
        });
        songInstance.startPlayback();
        await songInstance.waitForSongToFinish();
        const status = songInstance.getRootTrackState();
        expect(logCallback.callCount).to.eq(23)
        console.log(logCallback);
        expect(status.position).to.eq(8)
        expect(status.currentTime).to.eq(2)
    })

    it('playing a song without an instrument throws an error ', async () => {
        const songInstance = getSongPlayer(testSongNoInstrument, {
            handleTrackEvent: cy.stub()
        });
        try {
            songInstance.startPlayback();
            await songInstance.waitForSongToFinish();
            // noinspection ExceptionCaughtLocallyJS
            throw new Error("Song finished without error")
        } catch (e) {
            // @ts-ignore
            expect(e.message).to.eq(ERRORS.ERR_NO_INSTRUMENT)
        }
    })
})


async function testSong(trackRenderer: TrackRenderer) {
    const {wait: w, loadInstrument} = trackRenderer;
    await loadInstrument(testMelodicInstrument)
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


function testMelodicInstrument(config: object): InstrumentInstance {
    return function (noteEvent) {
        const {value} = noteEvent;
        if (!noteEvent.hasFrequency())
            throw new Error("Invalid melodic string: " + value)
        noteEvent.parseFrequency();
        return {
            onended: cy.stub(),
            stop: cy.stub(),
        }
    }
}

function testPercussionInstrument(config: object): InstrumentInstance {
    return function (noteEvent) {
        const {value} = noteEvent;
        if (noteEvent.hasFrequency())
            throw new Error("Invalid percussive string: " + value)
        return {
            onended: cy.stub(),
            stop: cy.stub(),
        }
    }
}

async function testTrackPercussion(trackRenderer: TrackRenderer) {
    const {playNote: n, wait: w, setVariable: v, loadInstrument} = trackRenderer;
    await loadInstrument(testPercussionInstrument)
    v('beatsPerMinute', 240)
    n("kick");
    n("hat");
    await w(1);
    n("hat");
    await w(1);
    n("snare");
    n("hat");
    await w(1);
    n("hat");
    await w(1);
    n("kick");
    n("hat");
    await w(1);
    n("kick");
    n("hat");
    await w(1);
    n("snare");
    n("hat");
    await w(1);
    n("hat");
    await w(1);
}