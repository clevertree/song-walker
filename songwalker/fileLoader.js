const {compileSongToJavascript} = require("./compiler.js");
module.exports = function fileLoader(source) {
    const {javascriptContent} = compileSongToJavascript(source, {eventMode: false});
    return javascriptContent;
}
