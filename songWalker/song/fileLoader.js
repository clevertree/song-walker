const {compiler} = require("./compiler");
module.exports = function fileLoader(source) {
    const [scriptContent] = compiler(source, {eventMode: false});
    return scriptContent;
}
