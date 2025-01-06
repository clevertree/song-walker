const functionStatement = /\b((?:(?:const|let)\s*)?[\w.]+\s*=\s*)?(await\s+)?\b([$\w][$\w.]+)\(((?:[^()]|\([^()]*\))*)\)/;
const LANGUAGE = {
    'comment': /(\/\/).*$/m,
    'track-definition': /(?=async\s+)?\btrack\b\s*([$\w][$\w]+)\(((?:[^()]|\([^()]*\))*)\)\s*{/,
    'loop-statement': /(?:for|while)\s*\((?:[^()]|\([^()]*\))*\)/,
    'variable-statement': {
        pattern: /((const|let|var)\s*)?[\w.]+\s*=[^\n;]+;?/,
        inside: {
            'function-statement': functionStatement
        },
    },
    'function-definition': /(?=async\s+)?\bfunction\b\s*([$\w][$\w]+)(\((?:[^()]|\([^()]*\))*\))\s*{/,
    'function-statement': functionStatement,
    'track-statement': /\|([a-zA-Z][^@^=;().\s]*)((?:[@^][^@^=;()\s]+)*)(?:\(((?:[^()]|\([^()]*\))*)\))?;?/,
    'command-statement': /\b([a-zA-Z][a-zA-Z0-9]*)((?:[@^][^@^=;()\s]+)*);?/,
    'wait-statement': /(\d*[\/.]?\d+)/
}
export default LANGUAGE
