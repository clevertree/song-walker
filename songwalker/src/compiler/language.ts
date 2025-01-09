const LANGUAGE = {
    'comment': /(\/\/).*$/m,
    'track-definition': /(?=async\s+)?\btrack\b\s*([$\w][$\w]+)\(((?:[^()]|\([^()]*\))*)\)\s*{/,
    'loop-statement': /(?:for|while)\s*\((?:[^()]|\([^()]*\))*\)/,
    // 'track-statement': /\|([a-zA-Z][^@^=;().\s]*)((?:[@^][^@^=;()\s]+)*)(?:\(((?:[^()]|\([^()]*\))*)\))?;?/,
    'function-statement': /\b((?:(?:const|let)\s*)?[\w.]+\s*=\s*)?(await\s+)?\b([$\w][$\w.]+)((?:[@^][^@^=;()\s]+)*)\(((?:[^()]|\([^()]*\))*)\)/,
    'variable-statement': /((const|let|var)\s*)?[\w.]+\s*=[^\n;]+;?/,
    'function-definition': /(?=async\s+)?\bfunction\b\s*([$\w][$\w]+)(\((?:[^()]|\([^()]*\))*\))\s*{/,
    'command-statement': /\b([a-zA-Z][a-zA-Z0-9]*)((?:[@^][^@^=;()\s]+)*);?/,
    'wait-statement': /(\d*[\/.]?\d+)/
}
export default LANGUAGE
