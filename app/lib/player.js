import {parseFrequencyString, parseDurationString} from "./note";

let audioCtx = null;

export default function player(song) {
    audioCtx = audioCtx || new AudioContext();
    const trackStartTime = audioCtx.currentTime;
    let trackCurrentPosition = 0;
    let instrument;

    function playNote(frequency, duration, ...args) {
        const startTime = trackStartTime + trackCurrentPosition;
        if (typeof frequency === "string")
            frequency = parseFrequencyString(frequency);
        if (typeof duration === "string")
            duration = parseDurationString(duration);
        instrument(frequency, startTime, duration, ...args);
    }

    function setInstrument(instrumentCallback) {
        instrument = instrumentCallback(audioCtx);
    }

    async function wait(duration) {
        if (typeof duration === "string")
            duration = parseDurationString(duration);
        // console.log('wait', trackCurrentPosition, length);
        trackCurrentPosition += duration;
    }

    function setBeatsPerMinute(bpm) {
        // trackCurrentPosition += seconds;
    }

    song({
        p: playNote,
        i: setInstrument,
        w: wait,
        bpm: setBeatsPerMinute
    });
}
