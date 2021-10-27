import * as Discord from "discord.js";
import fetch from "node-fetch" // making web requests
import { INVITE_LINK } from "./constants.js";
type DiscordCommand = (message : Discord.Message, content : string, ...args : unknown[]) => void

function Mention(user : Discord.User){
    return `<@${user.id}>`
}

async function GetReddit(subreddit : string, count : number = 50){
    const response = await fetch(`https://www.reddit.com/r/${subreddit}/.json?limit=${count}`, 
                    {method : 'GET', headers : {'User-agent' : 'reddit_discord_bot v0.05'}})
    return JSON.parse(await response.text())["data"]["children"]
}

function FilterTodaysPost(posts : any){
    const utc_now = new Date().getTime() / 1000
    const todays = []
    for (const p of posts){
        const data = p["data"]
        if (!('created_utc' in data)) continue
        const posted_utc = parseInt(data['created_utc'])
        console.log(`posted_utc : ${posted_utc} vs ${data['created_utc']}, NOW ${utc_now}`)

        let delta = utc_now - posted_utc
        console.log(delta > 1000 * 60 * 60 * 24)
        if (delta > 1000 * 60 * 60 * 24) continue // 1000ms * 60s * 60m * 24h
        todays.push(data)
    }
    return todays
}
async function GetRedditTodaysTop(message : Discord.Message, content : string, subreddit : string, idx : string = '-1'){
    const posts = await GetReddit(subreddit, 100)
    const todays = FilterTodaysPost(posts)

    let index = parseInt(idx)

    if (index < 0){
        index = Math.floor(Math.random() * todays.length)
    }
    if (todays.length <= 0)
    {
        await message.delete()
        await message.channel.send('No Post from today')
        return
    }
    const post = todays[index]

    const is_video = post['is_video']
    if (is_video){
        const loc = post['secure_media']['reddit_video']['fallback_url']
        const end = loc.split('.')[3]
        //console.log(`${typeof loc} loc ${loc} -> ${loc.includes('.mp4')}`)
        if (loc.includes('.mp4')){
            await message.delete()
            await message.channel.send({files : [loc]})
        }
        // const response = await fetch(loc, {method : 'GET', headers : {'User-agent' : 'reddit_discord_bot v0.05'}})
    }
    else{
        if ('url_overridden_by_dest' in post){
            const loc = post['url_overridden_by_dest']
            const end = loc.split('.')[3]

            // const response = await fetch(loc, {method : 'GET', headers : {'User-agent' : 'reddit_discord_bot v0.05'}})
            // const blob = await response.blob()
            // console.log(response)
            await message.delete()
            await message.channel.send({files : [loc]})
        }
    }
}

async function Test(message : Discord.Message, content : string){
    await message.channel.send(`received message : ${content}`)
}

async function InviteLink(message : Discord.Message, content : string){
    await message.delete()
    await message.channel.send(`${Mention(message.author)} here is the invite link: ${INVITE_LINK}`)
}

function IsTikTok(s : string){
    if (s.includes('https://www.tiktok.com/')) return true
    if (s.includes('https://vm.tiktok.com/')) return true
    return false
}

async function FilterTikTok(msg : Discord.Message){
    if (msg.author.bot) return;
    const content = msg.content.toLowerCase().trim();
    if (!IsTikTok(content)) return;
    await msg.delete();
    await msg.channel.send(`TIKTOK NOT ALLOWED ${Mention(msg.author)}`);
}

export {DiscordCommand, Test, IsTikTok, FilterTikTok, Mention, GetRedditTodaysTop, InviteLink}