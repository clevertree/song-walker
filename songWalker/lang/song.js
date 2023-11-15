const REGEXP_FUNCTION_CALL = /([^\s()]+)(?:\(([^)]+)\));?/;
const REGEXP_PLAY_STATEMENT = /([A-G][#qb]{0,2}\d?)((?::[^:;\s]*)*);?/;
const REGEXP_DURATION_STATEMENT = /(\d*[\/.]?\d+)([BTDt])?;?/;
const REGEXP_IMPORT_STATEMENT = /(?:\s|^)import\s+(\w+)\s+from\s+(['"][\w.\/]+['"]);?/;
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
        'function-call': REGEXP_FUNCTION_CALL,
        'play-statement': REGEXP_PLAY_STATEMENT,
        'wait-statement': REGEXP_DURATION_STATEMENT,
        // 'newline': REGEXP_NEWLINE
    },
}