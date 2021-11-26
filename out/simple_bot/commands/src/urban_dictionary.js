var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CommandConstructor } from "../../utility/comm_class.js";
import fetch from "node-fetch"; // making web requests
import { config } from "dotenv";
const API_KEY = load_api_key();
function load_api_key() {
    config();
    return process.env.URBAN_API_KEY;
}
function UrbanDefine(name, api_key) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch('https://mashape-community-urban-dictionary.p.rapidapi.com/define?' + new URLSearchParams({ term: name }), { method: 'GET',
            headers: {
                'x-rapidapi-host': 'mashape-community-urban-dictionary.p.rapidapi.com',
                'x-rapidapi-key': '7195268bd9msheb62269ccbb1c4dp1d8749jsn9d22b0c89a23'
            } });
        return JSON.parse(yield response.text())['list'];
    });
}
export const GetDefinition = CommandConstructor(_GetDefinition, "searches the definition of a word on urban dictionary", []);
function Defintion_2_String(defn) {
    return `${defn['definition'].replaceAll("[", "").replaceAll("]", "")} \n author : ${defn['author']} \n date : ${defn['written_on']}`;
}
function ToStringCounter(x) {
    if (x == 1)
        return "1st";
    if (x == 2)
        return "2nd";
    if (x == 3)
        return "3rd";
    return `${x}th`;
}
function _GetDefinition(client, message, ...content) {
    return __awaiter(this, void 0, void 0, function* () {
        //const cntn = content.split(" ")
        const cntn = content;
        let name = cntn[0];
        let index = cntn.length >= 2 ? parseInt(cntn[1]) : 0;
        const results = yield UrbanDefine(name, API_KEY);
        if (results.length <= 0) {
            return message.channel.send(`No definition found for ${name}`);
        }
        if (index >= results.length) {
            return message.channel.send(`No ${ToStringCounter(index)} definition for ${name}`);
        }
        return message.channel.send(`Definition ${name} \n ${Defintion_2_String(results[index])}`);
    });
}
