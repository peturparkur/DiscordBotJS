import * as Discord from "discord.js"
import { CommandConstructor, ICommand } from "../../../discord_utils/comm_class.js"

export const Test = CommandConstructor(_Test, "Test function for testing the connection", [])

async function _Test(client : Discord.Client, message : Discord.Message, ...content : string[]){
    return message.channel.send(`received message : ${message.content}`)
}

async function Test2(client : Discord.Client, message : Discord.Message, ...content : string[]){
    return message.channel.send(`received message : ${message.content}`)
}

export const RandomFunction = CommandConstructor(async (client : Discord.Client, message : Discord.Message, ...content : string[]) =>{
    return message.channel.send(`received message : ${message.content}`)
}, "Returns a random integer in the given range [min, max] or [0, max]", [])