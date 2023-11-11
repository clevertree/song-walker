import {parseFrequencyString, parseDurationString} from "./note";
import {act} from "react-dom/test-utils";

const BUFFER_DURATION = 1;
const START_DELAY = .1;
const DEFAULT_BPM = 60;

let instances = []

export function stopAllPlayers() {
    for (const instance of instances) {
        instance.stopPlayback();
        console.log("Stopping playback for", instance);
    }
    instances = [];
}


export function startSong(songCallback, audioContext = null) {
    audioContext = audioContext || new AudioContext();
    const startTime = audioContext.currentTime + START_DELAY
    const songInstance = {
        playing: true,
        startTime,
        bufferDuration: BUFFER_DURATION,
        activeInstruments: [],
        stopPlayback,
        audioContext
    }
    instances.push(songInstance);
    console.log("Starting playback ", instances);
    startTrackPlayback(songCallback, 0, startTime, DEFAULT_BPM, null, songInstance)
        .trackResult.then(() => {
        songInstance.playing = false;
        const index = instances.indexOf(songInstance);
        if (index > 1)
            instances.splice(index, 1)
        else
            console.error("Instance not found: ", songInstance)
    })
    return songInstance;

    function stopPlayback() {
        songInstance.playing = false;
        for (const trackInstrument of songInstance.activeInstruments) {
            trackInstrument.stopAllNotes()
        }
        songInstance.activeInstruments = []
    }
}

export function startTrackPlayback(trackCallback, trackPosition, trackCurrentTime, trackBeatsPerMinute, trackInstrument, songInstance) {
    const {startTime: songStartTime, audioContext, activeInstruments, bufferDuration} = songInstance;
    const activeSubTracks = [];

    function playNote(frequency, duration, ...args) {
        if (!songInstance.playing)
            throw Error("Playback has ended");
        const startTime = songStartTime + trackPosition;
        const durationWithBPM = duration * (60 / trackBeatsPerMinute)
        if (typeof frequency === "string")
            frequency = parseFrequencyString(frequency);
        // if (typeof duration === "string")
        //     duration = parseDurationString(duration, trackBPM);
        console.log("playNote", frequency, startTime, ...args)
        trackInstrument.playNote(frequency, startTime, durationWithBPM, ...args);
    }

    function loadInstrument(instanceName, instrumentCallback, ...args) {
        if (!songInstance.playing)
            throw Error("Playback has ended");
        trackInstrument = instrumentCallback(audioContext, ...args);
        activeInstruments[instanceName] = trackInstrument;
        return trackInstrument;
    }

    function setInstrument(instanceName) {
        trackInstrument = activeInstruments[instanceName];
        if (!trackInstrument)
            throw Error("Active instrument name not found: " + instanceName);
    }

    async function wait(duration) {
        if (!songInstance.playing)
            throw Error("Playback has ended");
        // console.log('wait', trackPosition, duration, durationBPM);
        // if (typeof duration === "string")
        //     duration = parseDurationString(duration, trackBPM);
        trackPosition += duration;
        trackCurrentTime += duration * (60 / trackBeatsPerMinute);
        await waitForBuffer();
    }

    async function waitForBuffer() {
        if (bufferDuration) {
            const playbackCurrentPosition = audioContext.currentTime - songStartTime;
            const waitTime = trackCurrentTime - (playbackCurrentPosition + bufferDuration);
            if (waitTime > 0) {
                console.log(`Waiting ${waitTime}s`);
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            }
        }
    }

    function setBeatsPerMinute(bpm) {
        trackBeatsPerMinute = bpm;
    }


    async function startTrack(subTrackCallback) {
        const trackInstance = startTrackPlayback(subTrackCallback, trackPosition, trackCurrentTime, trackBeatsPerMinute, trackInstrument, songInstance)
        activeSubTracks.push(trackInstance);
        await waitForBuffer();
    }

    const trackResult = trackCallback({
        playNote,
        loadInstrument,
        setInstrument,
        wait,
        setBeatsPerMinute,
        startTrack
    })
    return {
        trackResult,
        async waitForTrackFinish() {
            await trackResult;
            for (const activeSubTrack of activeSubTracks) {
                await activeSubTrack.waitForTrackFinish();
            }
        },
        getTrackStatus() {
            return {
                position: trackPosition,
                currentTime: trackCurrentTime,
                beatsPerMinute: trackBeatsPerMinute,
                instrument: trackInstrument
            }
        }
    }
}
