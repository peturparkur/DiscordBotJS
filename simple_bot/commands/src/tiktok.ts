import * as Discord from "discord.js";
import fetch from "node-fetch" // making web requests
import { Mention } from "../../utility/util.js";

type DiscordCommand = (client : Discord.Client, message : Discord.Message, ...args : string[]) => void

function IsTikTok(s : string){
    if (s.includes('https://www.tiktok.com/')) return true
    if (s.includes('https://vm.tiktok.com/')) return true
    return false
}

// Message function
async function FilterTikTok(msg : Discord.Message){
    if (msg.author.bot) return;
    const content = msg.content.toLowerCase().trim();
    if (!IsTikTok(content)) return;
    await msg.delete();
    await msg.channel.send(`TIKTOK NOT ALLOWED ${Mention(msg.author)}`);
}

export {DiscordCommand, IsTikTok, FilterTikTok, Mention}