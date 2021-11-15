import * as Discord from "discord.js"
import { CommandConstructor, ICommand } from "../../utility/comm_class.js"

export async function Test(client : Discord.Client, message : Discord.Message, ...content : string[]){
    await message.channel.send(`received message : ${message.content}`)
}

async function Test2(client : Discord.Client, message : Discord.Message, ...content : string[]){
    await message.channel.send(`received message : ${message.content}`)
}

export const RandomFunction = CommandConstructor(async (client : Discord.Client, message : Discord.Message, ...content : string[]) =>{
    await message.channel.send(`received message : ${message.content}`)
    return
}, "Returns a random integer in the given range [min, max] or [0, max]", [])