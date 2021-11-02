import { RollArray } from "../../../utility/putil_maths.js"
import * as Discord from "discord.js"

export interface Song{title : string, artist : string, url : string, length : number}
export class Song implements Song{
    constructor(url : string, title : string = 'blank', artist : string = 'unknown', length : number = 1){
        this.title = title //title if possible
        this.artist = artist //artis if possible
        this.url = url //url to read
        this.length = length // length is seconds
    }
}


export interface Playlist{title : string, songs : Array<Song>, current : Song, loop : boolean}
export class Playlist implements Playlist{
    connection : Discord.VoiceConnection = null

    constructor(title : string = '', loop : boolean = false, songs : Array<Song> | null = null){
        this.title = title
        if(songs){
            this.songs = songs.slice(0)
        }
        else{
            this.songs = new Array()
        }
        this.loop = loop
    }

    Next(i : number = 1){
        if(this.loop){
            RollArray(this.songs, i)
            return this.songs[0]
        }
        else{
            return this.songs.splice(i-1, 1)[0] //remove the i-th element
        }
    }
}
export function PrintPlaylist(list : Playlist){
    const arr : string[] = []
    list.songs.forEach(song => {
        arr.push(song.title)
    })
    return arr.join("\n ")
}
export function NextSong(list : Playlist, i : number = 1){
    if(list.loop){
        RollArray(list.songs, i)
        return list.songs[0]
    }
    else{
        return list.songs.splice(i, 1)[0] //remove the i-th element
    }
}

/*
class Playlist implements Playlist{
    loop : boolean = false
    idx : number = 0
    current : Song
    constructor(title : string, songs : Array<Song> | null = null, loop : boolean = false){
        this.title = title
        if(songs){
            this.songs = songs.slice(0)
        }
        else{
            this.songs = new Array()
        }
        this.loop = loop
        this.idx = 0
    }
    print() : string{
        const arr : string[] = []
        this.songs.forEach(song => {
            arr.push(song.title)
        })
        return arr.join(", ")
    }
    next(i : number = 1) : Song {
        if(this.loop){
            RollArray(this.songs, i)
            return this.songs[0]
        }
        else{
            return this.songs.splice(i, 1)[0] //remove the i-th element
        }
    }
}
*/

// export {Playlist, Song, PrintPlaylist, NextSong}