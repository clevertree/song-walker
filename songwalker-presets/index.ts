import {registerPresetBank} from "@songwalker/presets";
import {SongWalkerLibrary} from "./SongWalkerLibrary";
import {WebAudioFontLibrary} from "./WebAudioFont/WebAudioFontLibrary";

registerPresetBank(SongWalkerLibrary);
registerPresetBank(WebAudioFontLibrary);

export {
    SongWalkerLibrary
}
