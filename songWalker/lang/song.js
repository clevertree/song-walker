const REGEXP_FUNCTION_CALL = /([^\s()]+)(?:\(([^)]+)\));?/;
const REGEXP_PLAY_STATEMENT = /(?:\s|^)([A-G][#qb]{0,2}\d)((?::[^:;\s]*)*)(?:;|\s|$)/;
const REGEXP_DURATION_STATEMENT = /(?:\s|^)(\d*[\/.]?\d+)([BTDt])?(?:;|\s|$)/;
const REGEXP_IMPORT_STATEMENT = /import\s+(\w+)\s+from\s+(['"][\w.\/]+['"]);?/;
const REGEXP_GROUP_START = /@(\w+)/;
const REGEXP_NEWLINE = /\n\s*$/
const ROOT_TRACK = 'rootTrack'

module.exports = {
    ROOT_TRACK,
    REGEXP_FUNCTION_CALL,
    REGEXP_PLAY_STATEMENT,
    REGEXP_DURATION_STATEMENT,
    REGEXP_IMPORT_STATEMENT,
    REGEXP_GROUP_START,
    REGEXP_NEWLINE,
    LANGUAGE: {
        'group': REGEXP_GROUP_START,
        'import': REGEXP_IMPORT_STATEMENT,
        'import': {
            pattern: REGEXP_IMPORT_STATEMENT,
            inside: Prism.languages.javascript
        },
        'function-call': {
            pattern: REGEXP_FUNCTION_CALL,
            inside: Prism.languages.javascript
        },
        'newline': REGEXP_NEWLINE,
        'play-statement': REGEXP_PLAY_STATEMENT,
        'wait-statement': REGEXP_DURATION_STATEMENT,
    },
}