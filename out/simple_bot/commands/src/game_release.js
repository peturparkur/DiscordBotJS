var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fetch from "node-fetch"; // making web requests
import { CommandConstructor } from "../../utility/comm_class.js";
function get_elem(obj, idx) {
    return obj[Object.keys(obj)[0]];
}
function GetWiki(article = "2022_in_video_games", prop = "text") {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=${prop}&page=${article}`, { method: 'GET' });
        const obj = JSON.parse(yield response.text());
        const content = obj['parse']['text']["*"];
        const id = obj['parse']['pageid'];
        return content;
    });
}
function GetGameReleases(client, message, ...content) {
    return __awaiter(this, void 0, void 0, function* () {
        let f = yield fetch(`https://www.google.com/search?q=elden+ring+release+date&oq=elden+ring+release+date`, { method: 'GET' });
        console.log(f);
        /*
        console.log("Game Releases")
        const wiki_html = parse(await GetWiki("2022_in_video_games", "text"))
        const table = wiki_html.querySelectorAll(".wikitable")[4]
        console.log("Table")
        console.log(table)
        console.log(table.innerHTML)
        console.log("Children")
        for(let i = 1; i < 7; i+=1){
            console.log(table.childNodes[3].childNodes[i].toString())
        }
        */
        // Table is 8 x N
    });
}
export const GameReleases = CommandConstructor(GetGameReleases, "Returns Upcoming Game Releases", []);
