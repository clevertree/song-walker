const {compiler} = require("./compiler");
module.exports = function fileLoader(source) {
    [scriptContent] = compiler(source, {eventMode: false});
    return scriptContent;
}
