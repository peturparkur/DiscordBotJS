var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Playlist, PrintPlaylist, Song } from "./music_classes.js";
import ytdl from "ytdl-core"; //youtube system
import yts from "yt-search";
const playlists = new Map();
export function StreamYT(client, message, ...content) {
    return __awaiter(this, void 0, void 0, function* () {
        //const args = content.split(" ")
        let url = content[0];
        const vc = message.member.voice.channel;
        const playlist = playlists.get(message.guild); //get the playlist of this guild
        if (vc === null) {
            yield message.channel.send(`${message.member.displayName} Please join a Voice Channel`);
            return;
        }
        function get_song(content, url) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!ytdl.validateURL(url)) {
                    const finder = (query) => __awaiter(this, void 0, void 0, function* () {
                        const res = yield yts(query);
                        //return (res.videos.length > 1)? res.videos[0] : null;
                        return (res.videos.length > 1) ? new Song(res.videos[0].url, res.videos[0].title, res.videos[0].author.name, res.videos[0].duration.seconds) : null;
                    });
                    const song = yield finder(content.join(" "));
                    if (song) {
                        return song;
                    }
                    yield message.channel.send(`Error finding video`);
                }
            });
        }
        const song = yield get_song(content, url);
        if (!playlist) {
            playlists.set(message.guild, new Playlist('playlist', false));
            const playlist = playlists.get(message.guild);
            try {
                playlist.songs.push(song);
                yield message.channel.send(`Song ${song.title} was added`);
            }
            catch (err) {
                console.log(`Song is weird: ${song}, error ${err}`);
            }
            try {
                playlist.connection = yield vc.join();
                PlaySong(message.guild, message.channel, playlist);
            }
            catch (err) {
                playlists.delete(message.guild);
                yield message.channel.send("Error in connecting");
            }
        }
        else {
            try {
                playlist.songs.push(song);
                yield message.channel.send(`Song ${song.title} was added to the queue`);
            }
            catch (err) {
                console.log(`Song is weird: ${song}, error ${err}`);
            }
        }
    });
}
export function SkipYT(client, message, ...args) {
    return __awaiter(this, void 0, void 0, function* () {
        const playlist = playlists.get(message.guild);
        if (!playlist) {
            yield message.channel.send("No song is being played");
            return;
        }
        if (!message.member.voice.channel) {
            yield message.channel.send("You need to be in a channel to execute this command");
            return;
        }
        //NextSong(playlist, 1)
        //PlaySong(message.guild, message.channel as Discord.TextChannel, playlist)
        if (playlist.connection.dispatcher) {
            try {
                playlist.connection.dispatcher.end();
            }
            catch (err) {
                console.log(`Shouldn't happen ${err}`);
            }
        }
        playlist.Next();
        PlaySong(message.guild, message.channel, playlist);
    });
}
export function StopYT(client, message, ...args) {
    return __awaiter(this, void 0, void 0, function* () {
        const playlist = playlists.get(message.guild);
        if (!playlist) {
            yield message.channel.send("No song is being played");
            return;
        }
        if (!message.member.voice.channel) {
            yield message.channel.send("You need to be in a channel to execute this command");
            return;
        }
        playlist.songs = [];
        playlist.connection.dispatcher.end();
        playlist.connection.disconnect();
        playlists.delete(message.guild);
    });
}
export function ShowPlaylist(client, message, ...args) {
    return __awaiter(this, void 0, void 0, function* () {
        const playlist = playlists.get(message.guild);
        if (!playlist) {
            yield message.channel.send("No song is being played");
            return;
        }
        if (!message.member.voice.channel) {
            yield message.channel.send("You need to be in a channel to execute this command");
            return;
        }
        const txt = PrintPlaylist(playlist);
        yield message.channel.send(`Current Playlist: ` + txt);
    });
}
function PlaySong(guild, txtChannel, playlist) {
    return __awaiter(this, void 0, void 0, function* () {
        if (playlist.songs.length == 0) {
            playlist.connection.disconnect();
            playlists.delete(guild);
            return;
        }
        let song = playlist.songs[0];
        const stream = ytdl(song.url, { filter: "audioonly" });
        //console.log(vd)
        playlist.connection.play(stream, { seek: 0, volume: 1 }).on("finish", () => {
            //NextSong(playlist, 1)
            playlist.Next();
            PlaySong(guild, txtChannel, playlist);
        });
        yield txtChannel.send(`Playing ${song.title}, ${song.url}`);
    });
}
