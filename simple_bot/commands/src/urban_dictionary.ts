import { CommandConstructor, ICommand } from "../../utility/comm_class.js"
import * as Discord from "discord.js";
import fetch from "node-fetch" // making web requests
import {config} from "dotenv";

const API_KEY = load_api_key()

function load_api_key(){
    config()
    return process.env.URBAN_API_KEY
}
/**
 * API query to Urban Dictionary -> https://rapidapi.com/community/api/urban-dictionary/
 * @param name term to search for
 * @param api_key api key to query
 * @returns 
 */
async function UrbanDefine(name : string, api_key : string) : Promise<Array<object>> {
    const response = await fetch('https://mashape-community-urban-dictionary.p.rapidapi.com/define?' + new URLSearchParams({term : name}),
            {method : 'GET', 
            headers : {
                    'x-rapidapi-host': 'mashape-community-urban-dictionary.p.rapidapi.com',
                    'x-rapidapi-key': '7195268bd9msheb62269ccbb1c4dp1d8749jsn9d22b0c89a23'}})
    return JSON.parse(await response.text())['list']
}

export const GetDefinition = CommandConstructor(_GetDefinition, "searches the definition of a word on urban dictionary", [])

function Defintion_2_String(defn : object){
    return `${defn['definition'].replaceAll("[", "").replaceAll("]", "")} \n Examples : \n ${defn['example'].replaceAll("[", "").replaceAll("]", "")} \n date : ${defn['written_on']}`
}

function ToStringCounter(x : number){
    if(x == 1)
        return "1st"
    if (x == 2)
        return "2nd"
    if (x == 3)
        return "3rd"
    return `${x}th`
}

async function _GetDefinition(client : Discord.Client, message : Discord.Message, ...content : string[]){
    //const cntn = content.split(" ")
    const cntn = content
    //let name = cntn[0]
    let name = cntn.join(' ')
    let index = 0
    //let index = cntn.length >= 2 ? parseInt(cntn[1]) : 0
    try 
    {
        const results = await UrbanDefine(name, API_KEY)
        if (results.length <= 0){
            return message.channel.send(`No definition found for ${name}`)
        }
        if(index >= results.length){
            return message.channel.send(`No ${ToStringCounter(index)} definition for ${name}`)
        }
        return message.channel.send(`Definition ${name} \n ${Defintion_2_String(results[index])}`)
    } catch (error) 
    {
        return message.channel.send(`Error occured with definition ${name}`)
    }
}