import * as Discord from "discord.js";
import { Playlist, Song } from "./music_classes.js";
import ytdl from "ytdl-core"; //youtube system
import yts from "yt-search"
import fs from "fs" // file-system

export async function StreamYT(client : Discord.Client, message : Discord.Message, ...content : string[]){
    //const args = content.split(" ")
    let url = content[0]
    const vc = message.member.voice.channel
    if (vc === null){
        await message.channel.send(`${message.member.displayName} Please join a Voice Channel`)
        return
    }
    const vcConn = await vc.join()
    if (!ytdl.validateURL(url)){
        const finder = async (query) =>{
            const res = await yts(query)
            return (res.videos.length > 1)? res.videos[0] : null;
        }

        const video = await finder(content.join(" "))
        if(video){
            url = video.url
        }
        else{
            await message.channel.send(`Error finding video`)
        }
    }
    const vd = ytdl(url, {filter : "audioonly"})
    //console.log(vd)
    const dispatcher = vcConn.play(vd, {seek : 0, volume : 1}).on("finish", () =>{
        dispatcher.end()
        vc.leave()
    })
    await message.channel.send(`Playing ${url}`)
}