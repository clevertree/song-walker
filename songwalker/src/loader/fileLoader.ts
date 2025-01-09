import {compileSongToJavascript} from "../compiler/compiler.js";

module.exports = function fileLoader(source: string) {
    const callback = compileSongToJavascript(source);
    console.info((callback))
    return `module.exports={source:${JSON.stringify(source)}, callback: ${callback}};`;
}
