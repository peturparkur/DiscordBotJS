import * as Discord from "discord.js"
import { INVITE_LINK } from "../../constants.js";

export async function InviteLink(client : Discord.Client, message : Discord.Message){
    return message.channel.send(`${message.member.displayName} here is the invite link: ${INVITE_LINK}`)
}