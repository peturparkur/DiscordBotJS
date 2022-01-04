import * as Discord from "discord.js";
import fetch from "node-fetch" // making web requests
import { parse } from 'node-html-parser';
import { CommandConstructor } from "../../../discord_utils/comm_class.js";

function get_elem(obj : Object, idx : number){
    return obj[Object.keys(obj)[0]]
}

async function GetWiki(article : string = "2022_in_video_games", prop : string = "text") : Promise<string>
{
    const response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=${prop}&page=${article}`, 
                            {method : 'GET'})
    const obj = JSON.parse(await response.text())
    const content = obj['parse']['text']["*"]
    const id = obj['parse']['pageid']
    return content
}

async function GetGameReleases(client : Discord.Client, message : Discord.Message, ...content : string[]){

    let f = await fetch(`https://www.google.com/search?q=elden+ring+release+date&oq=elden+ring+release+date`, {method:'GET'})
    console.log(f)

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
}

export const GameReleases = CommandConstructor(
    GetGameReleases, 
    "Returns Upcoming Game Releases", 
    [])

