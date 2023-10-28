import {parseFrequencyString, parseDurationString} from "./note";

let audioCtx = null;

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

export function player(song) {
    stopAllPlayers();
    const instance = {
        stopPlayback
    }
    instances.push(instance);
    console.log("Starting playback ", instances);
    let playing = true;
    audioCtx = audioCtx || new AudioContext();
    const trackStartTime = audioCtx.currentTime + START_DELAY;
    let trackPosition = 0;
    let trackBPM = DEFAULT_BPM;
    let trackInstrument;
    let activeInstruments = []

    function playNote(frequency, duration, ...args) {
        if (!playing)
            throw Error("Playback has ended");
        const startTime = trackStartTime + trackPosition;
        const durationBPM = duration * (60 / trackBPM)
        if (typeof frequency === "string")
            frequency = parseFrequencyString(frequency);
        // if (typeof duration === "string")
        //     duration = parseDurationString(duration, trackBPM);
        trackInstrument.playNote(frequency, startTime, durationBPM, ...args);
    }

    function loadInstrument(instanceName, instrumentCallback, ...args) {
        if (!playing)
            throw Error("Playback has ended");
        trackInstrument = instrumentCallback(audioCtx, ...args);
        activeInstruments[instanceName] = trackInstrument;
        return trackInstrument;
    }

    function setInstrument(instanceName) {
        trackInstrument = activeInstruments[instanceName];
        if (!trackInstrument)
            throw Error("Active instrument name not found: " + instanceName);
    }

    async function wait(duration) {
        if (!playing)
            throw Error("Playback has ended");
        const durationBPM = duration * (60 / trackBPM)
        console.log('wait', trackPosition, duration, durationBPM);
        // if (typeof duration === "string")
        //     duration = parseDurationString(duration, trackBPM);
        trackPosition += durationBPM;
        const playbackCurrentPosition = audioCtx.currentTime - trackStartTime;
        const waitTime = trackPosition - (playbackCurrentPosition + BUFFER_DURATION);
        if (waitTime > 0) {
            console.log(`Waiting ${waitTime}s`);
            await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
        }
    }

    function setBeatsPerMinute(bpm) {
        trackBPM = bpm;
    }

    function stopPlayback() {
        playing = false;
        for (const trackInstrument of activeInstruments) {
            trackInstrument.stopAllNotes()
        }
        activeInstruments = []
    }

    function startGroup(groupCallback) {

    }

    instance.promise = song({
        playNote,
        loadInstrument,
        setInstrument,
        wait,
        setBeatsPerMinute,
        startGroup
    });
    instance.promise.then(() => {
        console.log("Track finished", instance)
        const index = instances.indexOf(instance);
        if (index > 1)
            instances.splice(index, 1)
    }).catch(error => {
        console.log("Track finished with error, ", error);
    })

    return instance;
}
