import {SongWalkerLibrary} from "./songWalkerLibrary";
import {GeneralUserGSLibrary} from "./generalUserGSLibrary";
import {WebAudioFontLibrary} from "./WebAudioFontLibrary";
import {registerPresetBank} from "@songwalker/instruments/library";

function registerAllPresetBanks() {
    registerPresetBank(GeneralUserGSLibrary);
    registerPresetBank(WebAudioFontLibrary);
    registerPresetBank(SongWalkerLibrary);
}

const SongWalkerPresets = {
    registerAllPresetBanks
}
export default SongWalkerPresets;
