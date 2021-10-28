import { RollArray } from "../../../utility/putil_maths.js";
class Song {
    constructor(url, title = "unknown", artist = "blank", length = 60 * 3) {
        this.title = title;
        this.artist = artist;
        this.url = url;
        if (typeof length === 'string') {
            try {
                this.length = parseInt(length);
            }
            catch (err) {
                console.log(`Can't convert ${length} into number`);
            }
        }
        else {
            this.length = length;
        }
    }
}
class Playlist {
    constructor(title, songs = null, loop = false) {
        this.loop = false;
        this.idx = 0;
        this.title = title;
        if (songs) {
            this.songs = songs.slice(0);
        }
        else {
            this.songs = new Array();
        }
        this.loop = loop;
        this.idx = 0;
    }
    print() {
        const arr = [];
        this.songs.forEach(song => {
            arr.push(song.title);
        });
        return arr.join(", ");
    }
    next(i = 1) {
        if (this.loop) {
            RollArray(this.songs, i);
            return this.songs[0];
        }
        else {
            return this.songs.splice(i, 1)[0]; //remove the i-th element
        }
    }
}
export { Playlist, Song };
