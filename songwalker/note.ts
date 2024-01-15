const DEFAULT_FREQUENCY_A4 = 432;

// const REGEX_DURATION = /^(\d*[\/.]{0,1}\d+)([BTDt])?$/;

// function isDurationString(noteLengthString) {
//     return REGEX_DURATION.test(noteLengthString)
// }

// function parseDurationString(noteLength, bpm = 60) {
//     const [, valueString, factorString] = noteLength.match(REGEX_DURATION);
//     let value = parseFloat(valueString);
//     switch (factorString) {
//         // TODO: support ticks?
//         case 'T':
//             value /= 1.5;
//             break;
//         case 'D':
//             value *= 1.5;
//             break;
//     }
//     return value * (60 / bpm);
// }

// function parseVelocityString(noteLength) {
//     return noteLength || DEFAULT_VELOCITY;
// }
//

const REGEX_FREQ = /^([A-G][#qb]{0,2})(\d)?$/

export function matchFrequencyString(noteString: string) {
    return noteString.match(REGEX_FREQ);
}

export function parseFrequencyString(noteString: string) {
    const match = matchFrequencyString(noteString);
    if (!match)
        return null;
    const [, note, octaveString] = match;
    const octave: number = parseInt(octaveString);
    // if (isNaN(octave))
    //     throw new Error("Invalid octave value: " + noteString);
    const {frequency} = parseFrequencyParts(note, octave);
    return frequency;
}

export function parseFrequencyParts(note: string, octave: number) {
    if (typeof LIST_NOTE_NAMES[note] === "undefined")
        throw new Error("Unrecognized Note: " + note);
    let keyNumber: number = LIST_NOTE_NAMES[note];
    if (keyNumber < 6)
        keyNumber = keyNumber + 24 + ((octave - 1) * 24) + 2;
    else
        keyNumber = keyNumber + ((octave - 1) * 24) + 2;
    let frequency = DEFAULT_FREQUENCY_A4 * Math.pow(2, (keyNumber - 98) / 24);
    return {
        note,
        octave,
        keyNumber,
        frequency
    };
}

interface NoteToKeyNumberMap {
    [note: string]: number
}

// TODO: change to regex calculation
const LIST_NOTE_NAMES: NoteToKeyNumberMap = {
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
