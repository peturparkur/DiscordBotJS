import * as Discord from "discord.js"

export async function Test(client : Discord.Client, message : Discord.Message, ...content : string[]){
    await message.channel.send(`received message : ${message.content}`)
}