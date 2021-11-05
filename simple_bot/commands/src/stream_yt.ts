import * as Discord from "discord.js";
import { NextSong, Playlist, PrintPlaylist, Song} from "./music_classes.js";
import ytdl from "ytdl-core"; //youtube system
import yts from "yt-search"
import fs from "fs" // file-system

const playlists : Map<Discord.Guild, Playlist> = new Map()
export async function StreamYT(client : Discord.Client, message : Discord.Message, ...content : string[]){
    //const args = content.split(" ")
    let url = content[0]
    const vc = message.member.voice.channel

    const playlist = playlists.get(message.guild) //get the playlist of this guild

    if (vc === null){
        await message.channel.send(`${message.member.displayName} Please join a Voice Channel`)
        return
    }
    async function get_song(content, url){
        if (!ytdl.validateURL(url)){
            const finder = async (query) => {
                const res = await yts(query)
                //return (res.videos.length > 1)? res.videos[0] : null;
                return (res.videos.length >= 1)? new Song(res.videos[0].url, res.videos[0].title, 
                                                        res.videos[0].author.name, res.videos[0].duration.seconds) : null;
            }
    
            const song = await finder(content.join(" "))
            if(song){
                return song
            }
            await message.channel.send(`Error finding video`)
        }
        else{
            const info = await ytdl.getBasicInfo(url)
            return new Song(url, info.videoDetails.title, info.videoDetails.author.name, parseInt(info.videoDetails.lengthSeconds))
        }
    }

    const song = await get_song(content, url)
    if(!playlist){
        playlists.set(message.guild, new Playlist('playlist', false));
        const playlist = playlists.get(message.guild)
        if(song){
            playlist.songs.push(song)
            await message.channel.send(`Song ${song.title} was added`)
        }
        else{
            console.log(`Song is weird: ${song}`)
        }
        try{
            playlist.connection = await vc.join()
            PlaySong(message.guild, message.channel as Discord.TextChannel, playlist)
        }
        catch (err){
            playlists.delete(message.guild)
            await message.channel.send("Error in connecting")
        }
    }
    else{
        if(song){
            playlist.songs.push(song)
            await message.channel.send(`Song ${song.title} was added to the queue`)
        }
        else{
            console.log(`Song is weird: ${song}`)
        }
    }
}

export async function SkipYT(client : Discord.Client, message : Discord.Message, ...args : string[]) {
    const playlist = playlists.get(message.guild)
    if (!playlist){
        await message.channel.send("No song is being played")
        return
    }
    if(!message.member.voice.channel){
        await message.channel.send("You need to be in a channel to execute this command")
        return
    }
    //NextSong(playlist, 1)
    //PlaySong(message.guild, message.channel as Discord.TextChannel, playlist)
    if(playlist.connection.dispatcher){
        try{
            playlist.connection.dispatcher.end()
        }
        catch (err){
            console.log(`Shouldn't happen ${err}`)
        }
    }
    playlist.Next()
    PlaySong(message.guild, message.channel as Discord.TextChannel, playlist)
}

export async function StopYT(client : Discord.Client, message : Discord.Message, ...args : string[]) {
    const playlist = playlists.get(message.guild)
    if (!playlist){
        await message.channel.send("No song is being played")
        return
    }
    if(!message.member.voice.channel){
        await message.channel.send("You need to be in a channel to execute this command")
        return
    }
    playlist.songs = [];
    playlist.connection.dispatcher.end()
    playlist.connection.disconnect()
    playlists.delete(message.guild)
}

export async function ShowPlaylist(client : Discord.Client, message : Discord.Message, ...args : string[]) {
    const playlist = playlists.get(message.guild)
    if (!playlist){
        await message.channel.send("No song is being played")
        return
    }
    if(!message.member.voice.channel){
        await message.channel.send("You need to be in a channel to execute this command")
        return
    }
    const txt = PrintPlaylist(playlist)
    await message.channel.send(`Current Playlist: ` + txt)
}

async function PlaySong(guild : Discord.Guild, txtChannel : Discord.TextChannel, playlist : Playlist){
    if (playlist.songs.length == 0){
        playlist.connection.disconnect()
        playlists.delete(guild)
        return
    }

    let song = playlist.songs[0]
    const stream = ytdl(song.url, {filter : "audioonly"})
    //console.log(vd)
    playlist.connection.play(stream, {seek : 0, volume : 1}).on("finish", () =>{
        //NextSong(playlist, 1)
        playlist.Next()
        PlaySong(guild, txtChannel, playlist)
    });
    await txtChannel.send(`Playing ${song.title}, ${song.url}`)
}