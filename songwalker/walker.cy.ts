import {SongWalker} from "./walker";
import {ERRORS} from "./constants";
import {InstrumentInstance, TrackRenderer, TrackState} from "@songwalker/types";
import PolyphonyInstrument from "./instruments/PolyphonyInstrument";
import {parseCommand, parseNote} from "./helper/commandHelper";

describe('songPlayer', () => {
    it('plays sub-tracks', async () => {
        const logCallback = cy.stub();
        const songInstance = new SongWalker(testSong, {
            handleTrackEvent: logCallback
        });
        await songInstance.waitForSongToFinish();
        const status = songInstance.rootTrackHandler?.getTrackState();
        expect(logCallback.callCount).to.eq(36)
        expect(status.position).to.eq(4)
        expect(status.currentTime).to.eq(2.25)
    })

    it('plays percussion track', async () => {
        const logCallback = cy.stub();
        const songInstance = new SongWalker(testTrackPercussion, {
            handleTrackEvent: logCallback
        });
        await songInstance.waitForSongToFinish();
        const status = trackHandler.getTrackState();
        expect(logCallback.callCount).to.eq(21)
        console.log(logCallback);
        expect(status.position).to.eq(8)
        expect(status.currentTime).to.eq(2)
    })

    it('playing a song without an instrument throws an error ', async () => {
        const songInstance = new SongWalker(testSongNoInstrument, {
            handleTrackEvent: cy.stub()
        });
        try {
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
    const {waitUntil: w, loadInstrument} = trackRenderer;
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

async function wait(trackState: TrackState, duration: number) {
    trackState.currentTime += (duration * (60 / trackState.beatsPerMinute));

}

function playCommand(trackState: TrackState, commandString: string) {
    const commandInfo = parseCommand(commandString);
    trackState.instrument(commandInfo.command, trackState, commandInfo.params)
}

const bps: number = 60 / 120;
const instrument: InstrumentInstance = PolyphonyInstrument();

async function newStyle(this: TrackState) {
    this.noteDuration = 1 / 4;
    playCommand(this, 'C5^2')
    // playCommand(this, 'config', {});
    // this.config = {} // no need for config objecthis
    await wait(this, (1 / 4));
    this.currentTime = 1
    this.noteVelocity = 3
    this.noteDuration = 1 / 4;
    playCommand(this, 'C4@/3');
    await wait(this, (1 / 4));
    playCommand(this, 'G4');
    await wait(this, (1 / 4));
    playCommand(this, 'Eb4');
    await wait(this, (1 / 4));
    playCommand(this, 'Eb5');
    await wait(this, (1 / 4));
    playCommand(this, 'F5');
    await wait(this, (1 / 4));
    playCommand(this, 'Eb5');
    await wait(this, (1 / 4));
    playCommand(this, 'D5');
    await wait(this, (1 / 4));
    testTrack.bind({...this})().then(); //TODO: always bind new object?
}

async function testTrack(this: TrackState) {
    const {playNote: n, waitUntil: w, setCurrentToken: _} = trackRenderer;

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
            addEventListener: cy.stub(),
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
            addEventListener: cy.stub(),
            stop: cy.stub(),
        }
    }
}

async function testTrackPercussion(trackRenderer: TrackRenderer) {
    const {playNote: n, waitUntil: w, setVariable: v, loadInstrument} = trackRenderer;
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
