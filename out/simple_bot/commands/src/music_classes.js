import { RollArray } from "../../../utility/putil_maths.js";
export class Song {
    constructor(url, title = 'blank', artist = 'unknown', length = 1) {
        this.title = title; //title if possible
        this.artist = artist; //artis if possible
        this.url = url; //url to read
        this.length = length; // length is seconds
    }
}
export class Playlist {
    constructor(title = '', loop = false, songs = null) {
        this.connection = null;
        this.title = title;
        if (songs) {
            this.songs = songs.slice(0);
        }
        else {
            this.songs = new Array();
        }
        this.loop = loop;
    }
    Next(i = 1) {
        if (this.loop) {
            RollArray(this.songs, i);
            return this.songs[0];
        }
        else {
            return this.songs.splice(i - 1, 1)[0]; //remove the i-th element
        }
    }
}
export function PrintPlaylist(list) {
    const arr = [];
    list.songs.forEach(song => {
        arr.push(song.title);
    });
    return arr.join("\n ");
}
export function NextSong(list, i = 1) {
    if (list.loop) {
        RollArray(list.songs, i);
        return list.songs[0];
    }
    else {
        return list.songs.splice(i, 1)[0]; //remove the i-th element
    }
}
