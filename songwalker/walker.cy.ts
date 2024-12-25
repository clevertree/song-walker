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
        const songState = await testSong.bind(getDefaultTrackState(destination))()
        // await songInstance.waitForSongToFinish();
        // expect(logCallback.callCount).to.eq(36)
        expect(songState.position).to.eq(4)
        expect(songState.currentTime).to.eq(2.25)
    })

    it('plays percussion track', async () => {
        const songState = await testTrackPercussion.bind(getDefaultTrackState(destination))()
        expect(songState.position).to.eq(8)
        expect(songState.currentTime).to.eq(2)
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
    const waitAsync = DefaultSongFunctions.waitAsync.bind(track);
    const config = cy.stub()
    track.instrument = await testMelodicInstrument.bind(this)(config)

    track.beatsPerMinute = 160;
    testTrack.bind(track)().then()
    testTrackNoInstrument.bind(track)().then()

    await waitAsync.bind(track)(2);

    track.beatsPerMinute = 80;
    testTrack.bind(track)().then()
    testTrackNoInstrument.bind(track)().then()

    await waitAsync.bind(track)(2);
    return track;
}

// async function testSongNoInstrument(this: TrackState) {
//     trackRenderer.startTrack(testTrack)
// }

async function testTrackNoInstrument(this: TrackState) {
    const track = {...this};
    const waitAsync = DefaultSongFunctions.waitAsync.bind(track);
    const play = DefaultSongFunctions.parseAndPlayCommand.bind(track);
    track.duration = 1 / 4;
    play('C5^2')
    // playCommand( 'config', {});
    // track.config = {} // no need for config objectrack
    await waitAsync(1 / 4);
    track.currentTime = 1
    track.velocity = 3
    track.duration = 1 / 4;
    play('C4@/3');
    await waitAsync(1 / 4);
    play('G4');
    await waitAsync(1 / 4);
    play('Eb4');
    await waitAsync(1 / 4);
    play('Eb5');
    await waitAsync(1 / 4);
    play('F5');
    await waitAsync(1 / 4);
    play('Eb5');
    await waitAsync(1 / 4);
    play('D5');
    await waitAsync(1 / 4);
    testTrack.bind(track)().then();
    return track;
}

async function testTrack(this: TrackState) {
    const track = {...this};
    const w = DefaultSongFunctions.waitAsync.bind(track);
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
    return track;
}


async function testTrackPercussion(this: TrackState) {
    const track = {...this};
    const w = DefaultSongFunctions.waitAsync.bind(track);
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
    return track;
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
