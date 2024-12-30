import {InstrumentLoader, TrackState} from "@songwalker/types";
import {parseNote} from "./helper/commandHelper";
import {getDefaultSongFunctions, getDefaultTrackState} from "@songwalker/helper/songHelper";

const DefaultSongFunctions = getDefaultSongFunctions()

describe('songPlayer', () => {
    const audioContext = new AudioContext();
    const {destination} = audioContext;

    it('plays sub-tracks', async () => {
        // const logCallback = cy.stub();
        const instrumentCallback = cy.stub();
        const songState = getDefaultTrackState(destination);
        songState.bufferDuration = 0.1;
        await testSong(songState, instrumentCallback)
        await DefaultSongFunctions.waitForTrackToFinish(songState);
        // await songInstance.waitForSongToFinish();
        console.log('songState', songState)
        expect(instrumentCallback.callCount).to.eq(32)
        expect(songState.position).to.eq(4)
        // expect(songState.currentTime).to.greaterThan(2.25)
    })

    // it('plays percussion track', async () => {
    //     const songState = getDefaultTrackState(destination);
    //     const trackState = await testTrackPercussion(songState)
    //     expect(trackState.position).to.eq(8)
    //     // expect(trackState.currentTime).to.greaterThan(2)
    // })
    //
    // it('playing a song without an instrument throws an error ', async () => {
    //     try {
    //         const songState = getDefaultTrackState(destination)
    //         await testTrackNoInstrument(songState)
    //         throw new Error("Track finished without error")
    //     } catch (e) {
    //         // @ts-ignore
    //         expect(e.message).to.eq(ERRORS.ERR_NO_INSTRUMENT)
    //     }
    // })
})


async function testSong(track: TrackState, instrumentCallback: (...args: any[]) => void) {
    const {waitAsync} = DefaultSongFunctions;
    track.instrument = await testMelodicInstrument(track, instrumentCallback)

    track.beatsPerMinute = 160;
    testTrack(track).then()
    testTrack2(track).then()

    await waitAsync(track, 2);

    track.beatsPerMinute = 80;
    testTrack(track).then()
    testTrack2(track).then()

    await waitAsync(track, 2);
}

// async function testSongNoInstrument(track: TrackState) {
//     trackRenderer.startTrack(testTrack)
// }

async function testTrack2(track: TrackState) {
    track = {...track, position: 0, parentTrack: track};
    const {waitAsync, parseAndExecute: play} = DefaultSongFunctions;
    track.duration = 1 / 4;
    play(track, 'C5^2')
    // playCommand( 'config', {});
    // track.config = {} // no need for config objectrack
    await waitAsync(track, 1 / 4);
    track.currentTime = 1
    track.velocity = 3
    track.duration = 1 / 6;
    play(track, 'C4@/3');
    await waitAsync(track, 1 / 4);
    play(track, 'G4');
    await waitAsync(track, 1 / 4);
    play(track, 'Eb4');
    await waitAsync(track, 1 / 4);
    play(track, 'Eb5');
    await waitAsync(track, 1 / 4);
    play(track, 'F5');
    await waitAsync(track, 1 / 4);
    play(track, 'Eb5');
    await waitAsync(track, 1 / 4);
    play(track, 'D5');
    await waitAsync(track, 1 / 4);
    return track;
}

async function testTrack(track: TrackState) {
    track = {...track, position: 0, parentTrack: track};
    const w = DefaultSongFunctions.waitAsync;
    const n = DefaultSongFunctions.execute;
    n(track, "C5", {duration: 1 / 4});
    await w(track, 1 / 4);
    n(track, "C4", {duration: 1 / 4});
    await w(track, 1 / 4);
    n(track, "G4", {duration: 1 / 4});
    await w(track, 1 / 4);
    n(track, "Eb4", {duration: 1 / 4});
    await w(track, 1 / 4);
    n(track, "Eb5", {duration: 1 / 4});
    await w(track, 1 / 4);
    n(track, "F5", {duration: 1 / 4});
    await w(track, 1 / 4);
    n(track, "Eb5", {duration: 1 / 4});
    await w(track, 1 / 4);
    n(track, "D5", {duration: 1 / 4});
    await w(track, 1 / 4);
    // n(track, "C5", {duration: 1 / 4});
    return track;
}


async function testTrackPercussion(track: TrackState) {
    track = {...track, position: 0, parentTrack: track};
    const w = DefaultSongFunctions.waitAsync;
    const n = DefaultSongFunctions.execute;
    track.instrument = await testPercussionInstrument(track, cy.stub())
    track.beatsPerMinute = 240;
    n(track, "kick");
    n(track, "hat");
    await w(track, 1);
    n(track, "hat");
    await w(track, 1);
    n(track, "snare");
    n(track, "hat");
    await w(track, 1);
    n(track, "hat");
    await w(track, 1);
    n(track, "kick");
    n(track, "hat");
    await w(track, 1);
    n(track, "kick");
    n(track, "hat");
    await w(track, 1);
    n(track, "snare");
    n(track, "hat");
    await w(track, 1);
    n(track, "hat");
    await w(track, 1);
    return track;
}

/** Instruments **/


const testMelodicInstrument: InstrumentLoader = (track, callback: (...args: any[]) => void) => {
    return function (track, command) {
        const {commandString} = command;
        const noteInfo = parseNote(commandString);
        if (!noteInfo)
            throw new Error("Unrecognized note: " + commandString);
        const {frequency, octave, note} = noteInfo;
        callback(commandString, frequency);
        // console.log("testMelodicInstrument", track, command)
        return {
            addEventListener: cy.stub(),
            stop: cy.stub(),
            frequency,
            octave,
            note
        }
    }
}

const testPercussionInstrument: InstrumentLoader = (track, callback: (...args: any[]) => void) => {
    return function (track, command) {
        callback({...track, ...command});
        const {commandString} = command;
        console.log("testPercussionInstrument", track, command)
        if (!['kick', 'hat', 'snare'].includes(commandString))
            throw new Error("Unrecognized percussive instrument: " + commandString)
        return {
            addEventListener: callback,
            stop: callback,
        }
    }
}
