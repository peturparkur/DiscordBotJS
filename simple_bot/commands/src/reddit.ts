import * as Discord from "discord.js";
import fetch from "node-fetch" // making web requests

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
        //console.log(`posted_utc : ${posted_utc} vs ${data['created_utc']}, NOW ${utc_now}`)

        let delta = utc_now - posted_utc
        //console.log(delta > 1000 * 60 * 60 * 24)
        if (delta > 1000 * 60 * 60 * 24) continue // 1000ms * 60s * 60m * 24h
        todays.push(data)
    }
    return todays
}
export async function GetRedditTodaysTop(client : Discord.Client, message : Discord.Message, ...content : string[]){
    //const cntn = content.split(" ")
    const cntn = content
    let subreddit = cntn[0]
    let index = cntn.length >= 2 ? parseInt(cntn[1]) : -1
    const posts = await GetReddit(subreddit, 100)
    const todays = FilterTodaysPost(posts)

    if (index < 0){
        index = Math.floor(Math.random() * todays.length)
    }
    if (todays.length <= 0)
    {
        await message.channel.send(`${message.member.displayName}: No post has been found for today`)
        return
    }
    const post = todays.length > index ? todays[index] : todays[todays.length - 1]

    const is_video = post['is_video']
    if (is_video){
        const loc = post['secure_media']['reddit_video']['fallback_url']
        const end = loc.split('.')[3]
        //console.log(`${typeof loc} loc ${loc} -> ${loc.includes('.mp4')}`)
        if (loc.includes('.mp4')){
            try{
                await message.channel.send(`${post['title']}`)
                await message.channel.send({files : [loc]})
            }
            catch (err){
                console.log(`Failed to send reddit MP4 ${err}`)
            }
        }
        else{
            await message.channel.send(`Content is not compatible: ${loc}`)
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
            try{
                await message.channel.send(`${post['title']}`)
                await message.channel.send({files : [loc]})
            }
            catch (err){
                console.log(`Failed to send reddit post ${err}`)
            }
        }
    }
}