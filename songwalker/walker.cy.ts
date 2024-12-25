import ERRORS from "./constants/errors";
import {InstrumentLoader, TrackState} from "@songwalker/types";
import {parseNote} from "./helper/commandHelper";
import {getDefaultSongFunctions, getDefaultTrackState} from "@songwalker/helper/songHelper";

const DefaultSongFunctions = getDefaultSongFunctions()

describe('songPlayer', () => {
    const audioContext = new AudioContext();
    const {destination} = audioContext;
    it('plays sub-tracks', async () => {
        // const logCallback = cy.stub();
        const trackState: TrackState = {
            ...getDefaultTrackState(destination),
        }
        await testSong.bind(trackState)()
        // await songInstance.waitForSongToFinish();
        // expect(logCallback.callCount).to.eq(36)
        expect(trackState.position).to.eq(4)
        expect(trackState.currentTime).to.eq(2.25)
    })

    it('plays percussion track', async () => {
        const trackState: TrackState = {
            ...getDefaultTrackState(destination),
        }
        await testTrackPercussion.bind(trackState)()
        expect(trackState.position).to.eq(8)
        expect(trackState.currentTime).to.eq(2)
    })

    it('playing a song without an instrument throws an error ', async () => {
        try {
            const trackState: TrackState = {
                ...getDefaultTrackState(destination),
            }
            await testTrackNoInstrument.bind(trackState)()
            throw new Error("Track finished without error")
        } catch (e) {
            // @ts-ignore
            expect(e.message).to.eq(ERRORS.ERR_NO_INSTRUMENT)
        }
    })
})


async function testSong(this: TrackState) {
    const track = {...this};
    const wait = DefaultSongFunctions.wait.bind(track);
    const config = {
        addEventListener: cy.stub(),
        stop: cy.stub(),
    };
    track.instrument = await testMelodicInstrument.bind(this)(config)

    track.beatsPerMinute = 160;
    testTrack.bind(track)().then()
    testTrackNoInstrument.bind(track)().then()

    await wait.bind(track)(2);

    track.beatsPerMinute = 80;
    testTrack.bind(track)().then()
    testTrackNoInstrument.bind(track)().then()

    await wait.bind(track)(2);
}

// async function testSongNoInstrument(this: TrackState) {
//     trackRenderer.startTrack(testTrack)
// }

async function testTrackNoInstrument(this: TrackState) {
    const track = {...this};
    const wait = DefaultSongFunctions.wait.bind(track);
    const playCommand = DefaultSongFunctions.playCommand.bind(track);
    track.duration = 1 / 4;
    playCommand('C5^2')
    // playCommand( 'config', {});
    // track.config = {} // no need for config objectrack
    await wait((1 / 4));
    track.currentTime = 1
    track.velocity = 3
    track.duration = 1 / 4;
    playCommand('C4@/3');
    await wait((1 / 4));
    playCommand('G4');
    await wait((1 / 4));
    playCommand('Eb4');
    await wait((1 / 4));
    playCommand('Eb5');
    await wait((1 / 4));
    playCommand('F5');
    await wait((1 / 4));
    playCommand('Eb5');
    await wait((1 / 4));
    playCommand('D5');
    await wait((1 / 4));
    testTrack.bind(track)().then();
}

async function testTrack(this: TrackState) {
    const track = {...this};
    const w = DefaultSongFunctions.wait.bind(track);
    const n = DefaultSongFunctions.playCommand.bind(track);
    const _ = (tokenID: number) => {
    };

    let tokenID = 1
    _(tokenID++);
    n("C5", {duration: 1 / 4});
    _(tokenID++);
    await w(1 / 4);
    _(tokenID++);
    n("C4", {duration: 1 / 4});
    _(tokenID++);
    await w(1 / 4);
    n("G4", {duration: 1 / 4});
    _(tokenID++);
    await w(1 / 4);
    n("Eb4", {duration: 1 / 4});
    _(tokenID++);
    await w(1 / 4);
    n("Eb5", {duration: 1 / 4});
    _(tokenID++);
    await w(1 / 4);
    _(tokenID++);
    n("F5", {duration: 1 / 4});
    await w(1 / 4);
    _(tokenID++);
    n("Eb5", {duration: 1 / 4});
    await w(1 / 4);
    _(tokenID++);
    n("D5", {duration: 1 / 4});
    await w(1 / 4);
    // n("C5", {duration: 1 / 4});
}


async function testTrackPercussion(this: TrackState) {
    const track = {...this};
    const w = DefaultSongFunctions.wait.bind(track);
    const n = DefaultSongFunctions.playCommand.bind(track);
    track.instrument = await testPercussionInstrument.bind(this)(cy.stub())
    track.beatsPerMinute = 240;
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

/** Instruments **/


const testMelodicInstrument: InstrumentLoader = (callback: () => void) => {
    return function (commandState) {
        const noteInfo = parseNote(commandState.command);
        if (!noteInfo)
            throw new Error("Unrecognized note: " + commandState.command);
        const {frequency, octave, note} = noteInfo;
        callback();
        return {
            addEventListener: cy.stub(),
            stop: cy.stub(),
            frequency,
            octave,
            note
        }
    }
}

const testPercussionInstrument: InstrumentLoader = (callback: () => void) => {
    return function ({command}) {
        callback();
        if (!['kick', 'hat', 'snare'].includes(command))
            throw new Error("Unrecognized percussive instrument: " + command)
        return {
            addEventListener: cy.stub(),
            stop: cy.stub(),
        }
    }
}
