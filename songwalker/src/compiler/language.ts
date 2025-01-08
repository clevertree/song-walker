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
    'track-statement': /\|([a-zA-Z][^@^=;().\s]*)((?:[@^][^@^=;()\s]+)*)(?:\(((?:[^()]|\([^()]*\))*)\))?;?/,
    'function-statement': functionStatement,
    'command-statement': /\b([a-zA-Z][a-zA-Z0-9]*)((?:[@^][^@^=;()\s]+)*);?/,
    'wait-statement': /(\d*[\/.]?\d+)/
}
export default LANGUAGE
