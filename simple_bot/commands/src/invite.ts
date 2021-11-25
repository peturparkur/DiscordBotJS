import * as Discord from "discord.js"
import { INVITE_LINK } from "../../constants.js";
import { CommandConstructor, ICommand } from "../../utility/comm_class.js"

export const InviteLink = CommandConstructor(_InviteLink, "Returns the invite link of the bot", [])

async function _InviteLink(client : Discord.Client, message : Discord.Message){
    return message.channel.send(`${message.member.displayName} here is the invite link: ${INVITE_LINK}`)
}