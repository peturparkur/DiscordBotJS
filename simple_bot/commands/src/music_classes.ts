import { RollArray } from "../../../utility/putil_maths.js"

interface Song{title : string, artist : string, url : string, length : number}
class Song implements Song{
    constructor(url : string, title : string = "unknown", artist : string = "blank", length : number | string = 60 * 3){
        this.title = title
        this.artist = artist
        this.url = url
        if(typeof length === 'string'){
            try{
                this.length = parseInt(length)
            }
            catch(err){
                console.log(`Can't convert ${length} into number`)
            }
        }
        else{
            this.length = length
        }
    }
}

interface Playlist{title : string, songs : Array<Song>}
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

export {Playlist, Song}