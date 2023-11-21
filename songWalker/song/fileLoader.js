const {compiler} = require("./compiler");
module.exports = function fileLoader(source) {
    [scriptContent] = compiler(source, {debugMode: false});
    return scriptContent;
}
