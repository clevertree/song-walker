import {Instrument, SongState, TrackRenderer, TrackState, walkTrack} from "./walker";


let testInstrumentInstance: Instrument, testSongState: SongState, testTrackInitialState: TrackState;
describe('songPlayer', () => {
    beforeEach(() => {
        testInstrumentInstance = {
            stopActiveFrequencies(): void {
            },
            playFrequency: cy.stub()
        }

        testSongState = {
            eventHandlers: [],
            isPlaying: true
        }

        testTrackInitialState = {
            beatsPerMinute: 0,
            bufferDuration: 0,
            currentTime: 0,
            destination: new AudioContext().destination,
            instrument: testInstrumentInstance,
            noteDuration: 0,
            noteVelocity: 0,
            position: 0

        }
    })

    it('plays a song', async () => {
        const songInstance = walkTrack(testTrack, testTrackInitialState, testSongState);
        await songInstance.waitForTrackToFinish();
        // @ts-ignore
        expect(testInstrumentInstance.playFrequency.callCount).to.eq(9)
    })

    it('plays sub-tracks', async () => {
        const songInstance = walkTrack(testSong, testTrackInitialState, testSongState);
        await songInstance.waitForTrackToFinish();
        const status = songInstance.getTrackState();
        // @ts-ignore
        expect(testInstrumentInstance.playFrequency.callCount).to.eq(18)
        expect(status.position).to.eq(16)
        expect(status.currentTime).to.eq(12)
    })

})


async function testSong(trackState: TrackState, trackRenderer: TrackRenderer) {
    const {playNote: n, wait: w} = trackRenderer;

    trackRenderer.setVariable('beatsPerMinute', 120)
    trackRenderer.startTrack(testTrack)
    await w(8);
    trackRenderer.setVariable('beatsPerMinute', 60)
    trackRenderer.startTrack(testTrack)
    await w(8);
}

async function testTrack(trackState: TrackState, trackRenderer: TrackRenderer) {
    const {playNote: n, wait: w} = trackRenderer;

    trackRenderer.setVariable('beatsPerMinute', 120)

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
}