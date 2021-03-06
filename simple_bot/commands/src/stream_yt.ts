import * as Discord from "discord.js";
import { NextSong, Playlist, PrintPlaylist, Song} from "./music_classes.js";
import ytdl from "ytdl-core"; //youtube system
import yts from "yt-search"
import fs from "fs" // file-system
import { CommandConstructor, ICommand } from "../../../discord_utils/comm_class.js"

const playlists : Map<Discord.Guild, Playlist> = new Map()

async function finder(query : string | yts.Options){
    const q = yts(query)
    //const res = await yts(query)
    return q.then(res => {
        return (res.videos.length >= 1)? new Song(res.videos[0].url, res.videos[0].title, 
            res.videos[0].author.name, res.videos[0].duration.seconds) : null;
    })
}

export const StreamYT = CommandConstructor(_StreamYT, 'Add a song from name/url to the playlist', [])

async function _StreamYT(client : Discord.Client, message : Discord.Message, ...content : string[]){
    //const args = content.split(" ")
    let url = content[0]
    const vc = message.member.voice.channel

    const playlist = playlists.get(message.guild) //get the playlist of this guild

    if (vc === null){
        message.channel.send(`${message.member.displayName} Please join a Voice Channel`)
        return
    }
    async function get_song(content, url){
        if (!ytdl.validateURL(url)){
            console.log('Invalid URL')
            const song = finder(content.join(" "))
            return song.then(s => {
                if (s)
                    return s
                message.channel.send(`Error finding video`)
            })
        }
        else{
            console.log('Valid URL')
            const info = ytdl.getInfo(url)
            return info.then(info =>{
                return new Song(url, info.videoDetails.title, info.videoDetails.author.name, parseInt(info.videoDetails.lengthSeconds))
            })
            //console.log(`Info from song: ${info.videoDetails}`)
            //return new Song(url, "", "", 60)
        }
    }

    const song = get_song(content, url)
    song.then(song => {
        if(!playlist){
            playlists.set(message.guild, new Playlist('playlist', false));
            const playlist = playlists.get(message.guild)
            if(song){
                playlist.songs.push(song)
                message.channel.send(`Song ${song.title} was added`)
            }
            else{
                console.log(`Song is weird: ${song}`)
            }
            try{
                vc.join().then(conn =>{
                    playlist.connection = conn
                    PlaySong(message.guild, message.channel as Discord.TextChannel, playlist)
                })
            }
            catch (err){
                playlists.delete(message.guild)
                message.channel.send("Error in connecting")
            }
        }
        else{
            if(song){
                playlist.songs.push(song)
                message.channel.send(`Song ${song.title} was added to the queue`)
            }
            else{
                console.log(`Song is weird: ${song}`)
            }
        }
    })
    
}

export const SkipYT = CommandConstructor(_SkipYT, "Skips the current song in the playlist", [])

async function _SkipYT(client : Discord.Client, message : Discord.Message, ...args : string[]) {
    const playlist = playlists.get(message.guild)
    if (!playlist){
        return message.channel.send("No song is being played")
    }
    if(!message.member.voice.channel){
        return message.channel.send("You need to be in a channel to execute this command")
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

export const StopYT = CommandConstructor(_StopYT, "clears the current playlist", [])

async function _StopYT(client : Discord.Client, message : Discord.Message, ...args : string[]) {
    const playlist = playlists.get(message.guild)
    if (!playlist){
        return message.channel.send("No song is being played")
    }
    if(!message.member.voice.channel){
        return message.channel.send("You need to be in a channel to execute this command")
    }
    playlist.songs = [];
    playlist.connection.dispatcher.end()
    playlist.connection.disconnect()
    playlists.delete(message.guild)
}


export const ShowPlaylist = CommandConstructor(_ShowPlaylist, "Shows the current songs added to the playlist", [])

async function _ShowPlaylist(client : Discord.Client, message : Discord.Message, ...args : string[]) {
    const playlist = playlists.get(message.guild)
    if (!playlist){
        return message.channel.send("No song is being played")
    }
    if(!message.member.voice.channel){
        return message.channel.send("You need to be in a channel to execute this command")
    }
    const txt = PrintPlaylist(playlist)
    return message.channel.send(`Current Playlist: ` + txt)
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
    return txtChannel.send(`Playing ${song.title}, ${song.url}`)
}

export const JoinVoiceChannel = CommandConstructor(_JoinVoiceChannel, "Join the voice channel", [])
async function _JoinVoiceChannel(client : Discord.Client, message : Discord.Message, ...args : string[]) {
    // .join
    const vc = message.member.voice.channel
    if(!vc){
        return message.channel.send(`${message.member.nickname} you're not in a voice channel!`)
    }
    try{
        vc.join()
    }
    catch (err) {
        return message.channel.send(`Couldn't join the voice channel due to ${err}`)
    }
}

export const LeaveVoiceChannel = CommandConstructor(_LeaveVoiceChannel, "Leave the currently joined voice channel", [])
async function _LeaveVoiceChannel(client : Discord.Client, message : Discord.Message, ...args : string[]) {
    // .join
    try{
        message.member.voice.channel.leave()
    }
    catch (error) {
        return message.channel.send(`Couldn't leave voice channel due to ${error}`)
    }
}