const DEFAULT_FREQUENCY_A4 = 432;
module.exports = {
    isDurationString,
    parseDurationString,
    parseVelocityString,
    isFrequencyString,
    parseFrequencyString
}

const REGEX_DURATION = /^(\d*[\/.]{0,1}\d+)([BTDt])?$/;

function isDurationString(noteLengthString) {
    return REGEX_DURATION.test(noteLengthString)
}

function parseDurationString(noteLength, bpm = 60) {
    const [, valueString, factorString] = noteLength.match(REGEX_DURATION);
    let value = parseFloat(valueString);
    switch (factorString) {
        // TODO: support ticks?
        case 'T':
            value /= 1.5;
            break;
        case 'D':
            value *= 1.5;
            break;
    }
    return value * (60 / bpm);
}

function parseVelocityString(noteLength) {
    return noteLength || DEFAULT_VELOCITY;
}

function isFrequencyString(noteString) {
    return /^[A-G][#qb]{0,2}\d?$/.test(noteString);
}

function parseFrequencyString(noteString) {
    const {frequency} = parseFrequencyParts(noteString);
    return frequency;
}

function parseFrequencyParts(noteString) {
    if (typeof noteString !== "string")
        throw new Error("Frequency is not a string");
    if (!noteString)
        throw new Error("Frequency is null");

    const ret = {
        note: noteString.slice(0, -1),
    }
    ret.octave = parseInt(noteString.slice(-1));
    if (isNaN(ret.octave))
        throw new Error("Invalid octave value: " + noteString);
    if (typeof LIST_NOTE_NAMES[ret.note] === "undefined")
        throw new Error("Unrecognized Note: " + ret.note);
    ret.keyNumber = LIST_NOTE_NAMES[ret.note];
    if (ret.keyNumber < 6)
        ret.keyNumber = ret.keyNumber + 24 + ((ret.octave - 1) * 24) + 2;
    else
        ret.keyNumber = ret.keyNumber + ((ret.octave - 1) * 24) + 2;
    ret.frequency = DEFAULT_FREQUENCY_A4 * Math.pow(2, (ret.keyNumber - 98) / 24);
    return ret;
}

// TODO: change to regex calculation
const LIST_NOTE_NAMES = {
    'A': 0,
    'Aq': 1,
    'A#': 2,
    'A#q': 3,
    'Bb': 2,
    'Bbq': 3,
    'B': 4,
    'Bq': 5,
    'C': 6,
    'Cq': 7,
    'C#': 8,
    'C#q': 9,
    'Db': 8,
    'Dbq': 9,
    'D': 10,
    'Dq': 11,
    'D#': 12,
    'D#q': 13,
    'Eb': 12,
    'Ebq': 13,
    'E': 14,
    'Eq': 15,
    'E#': 16,
    'E#q': 17,
    'F': 16,
    'Fq': 17,
    'F#': 18,
    'F#q': 19,
    'Gb': 18,
    'Gbq': 19,
    'G': 20,
    'Gq': 21,
    'G#': 22,
    'G#q': 23,
    'Ab': 22,
    'Abq': 23,
}
