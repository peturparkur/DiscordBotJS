import * as Discord from "discord.js";

export function Mention(user : Discord.User){
    return `<@${user.id}>`
}