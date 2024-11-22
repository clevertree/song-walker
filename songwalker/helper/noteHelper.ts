const DEFAULT_FREQUENCY_A4 = 432;

const REGEX_COMMAND = /^([A-G][#qb]{0,2})(\d*)((?:[vd]\d*(?:[.\/]\d+)?)+)$/
const REGEX_COMMAND_PARAMS = /([vd])((\d*)(?:([.\/])(\d+))?)/g

interface ParsedNoteCommandParams {
    velocity?: number,
    duration?: number
}
interface ParsedNoteCommand {
    note: string,
    octave: number,
    frequency: number,
    params: ParsedNoteCommandParams
}

export function parseNoteParams(paramString: string) {
    const params:ParsedNoteCommandParams = {}
        const paramMatches = [...paramString.matchAll(REGEX_COMMAND_PARAMS)];
        for(const paramMatch of paramMatches) {
            let [, paramName, paramValue, paramNumerator, valueFraction, valueDenominator] = paramMatch;
            let calcValue = (valueFraction === '/')
                ? (paramNumerator ? parseInt(paramNumerator) : 1) / parseInt(valueDenominator)
                : parseFloat(paramValue)
            switch(paramName) {
                case 'v':
                    params.velocity = calcValue
                    break;
                case 'd':
                    params.duration = calcValue
                    break;
            }
        }
        return params;
}

export function parseNote(noteString: string):ParsedNoteCommand|null {
    const match = noteString.match(REGEX_COMMAND);
    if(!match)
        return null;
    const [, note, octaveString, paramString] = match;
    const octave: number = parseInt(octaveString);
    if (typeof LIST_NOTE_NAMES[note] === "undefined")
        throw new Error("Unrecognized Note: " + note);
    let keyNumber: number = LIST_NOTE_NAMES[note];
    if (keyNumber < 6)
        keyNumber = keyNumber + 24 + ((octave - 1) * 24) + 2;
    else
        keyNumber = keyNumber + ((octave - 1) * 24) + 2;
    let frequency = DEFAULT_FREQUENCY_A4 * Math.pow(2, (keyNumber - 98) / 24);
    const params = parseNoteParams(paramString);
    return {
        note,
        octave,
        // keyNumber,
        frequency,
        params
    }
}

const REGEX_FREQOld = /^([A-G][#qb]{0,2})(\d)?$/

export function matchFrequencyString(noteString: string) {
    return noteString.match(REGEX_FREQOld);
}

export function parseFrequencyString(noteString: string) {
    const match = matchFrequencyString(noteString);
    if (!match)
        throw new Error("Unrecognized frequency: " + noteString);
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
