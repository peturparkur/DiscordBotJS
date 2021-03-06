var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fetch from "node-fetch"; // making web requests
import { INVITE_LINK } from "./constants.js";
import ytdl from "ytdl-core"; //youtube system
import yts from "yt-search";
function Mention(user) {
    return `<@${user.id}>`;
}
function GetReddit(subreddit, count = 50) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`https://www.reddit.com/r/${subreddit}/.json?limit=${count}`, { method: 'GET', headers: { 'User-agent': 'reddit_discord_bot v0.05' } });
        return JSON.parse(yield response.text())["data"]["children"];
    });
}
function FilterTodaysPost(posts) {
    const utc_now = new Date().getTime() / 1000;
    const todays = [];
    for (const p of posts) {
        const data = p["data"];
        if (!('created_utc' in data))
            continue;
        const posted_utc = parseInt(data['created_utc']);
        //console.log(`posted_utc : ${posted_utc} vs ${data['created_utc']}, NOW ${utc_now}`)
        let delta = utc_now - posted_utc;
        //console.log(delta > 1000 * 60 * 60 * 24)
        if (delta > 1000 * 60 * 60 * 24)
            continue; // 1000ms * 60s * 60m * 24h
        todays.push(data);
    }
    return todays;
}
function GetRedditTodaysTop(client, message, ...content) {
    return __awaiter(this, void 0, void 0, function* () {
        //const cntn = content.split(" ")
        const cntn = content;
        let subreddit = cntn[0];
        let index = cntn.length >= 3 ? parseInt(cntn[1]) : -1;
        const posts = yield GetReddit(subreddit, 100);
        const todays = FilterTodaysPost(posts);
        if (index < 0) {
            index = Math.floor(Math.random() * todays.length);
        }
        if (todays.length <= 0) {
            yield message.channel.send(`${message.member.displayName}: No post has been found for today`);
            return;
        }
        const post = todays.length > index ? todays[index] : todays[todays.length - 1];
        const is_video = post['is_video'];
        if (is_video) {
            const loc = post['secure_media']['reddit_video']['fallback_url'];
            const end = loc.split('.')[3];
            //console.log(`${typeof loc} loc ${loc} -> ${loc.includes('.mp4')}`)
            if (loc.includes('.mp4')) {
                yield message.channel.send(`${post['title']}`);
                yield message.channel.send({ files: [loc] });
            }
            else {
                yield message.channel.send(`Content is not compatible: ${loc}`);
            }
            // const response = await fetch(loc, {method : 'GET', headers : {'User-agent' : 'reddit_discord_bot v0.05'}})
        }
        else {
            if ('url_overridden_by_dest' in post) {
                const loc = post['url_overridden_by_dest'];
                const end = loc.split('.')[3];
                // const response = await fetch(loc, {method : 'GET', headers : {'User-agent' : 'reddit_discord_bot v0.05'}})
                // const blob = await response.blob()
                // console.log(response)
                yield message.channel.send(`${post['title']}`);
                yield message.channel.send({ files: [loc] });
            }
        }
    });
}
function Test(client, message, ...content) {
    return __awaiter(this, void 0, void 0, function* () {
        yield message.channel.send(`received message : ${message.content}`);
    });
}
function StreamYT(client, message, ...content) {
    return __awaiter(this, void 0, void 0, function* () {
        //const args = content.split(" ")
        let url = content[0];
        const vc = message.member.voice.channel;
        if (vc === null) {
            yield message.channel.send(`${message.member.displayName} Please join a Voice Channel`);
            return;
        }
        const vcConn = yield vc.join();
        if (!ytdl.validateURL(url)) {
            const finder = (query) => __awaiter(this, void 0, void 0, function* () {
                const res = yield yts(query);
                return (res.videos.length > 1) ? res.videos[0] : null;
            });
            const video = yield finder(content.join(" "));
            if (video) {
                url = video.url;
            }
            else {
                yield message.channel.send(`Error finding video`);
            }
        }
        const vd = ytdl(url, { filter: "audioonly" });
        //console.log(vd)
        vcConn.play(vd, { seek: 0, volume: 1 }).on("finish", () => {
            vc.leave();
        });
        yield message.channel.send(`Playing ${url}`);
    });
}
function InviteLink(client, message) {
    return __awaiter(this, void 0, void 0, function* () {
        yield message.channel.send(`${message.member.displayName} here is the invite link: ${INVITE_LINK}`);
    });
}
function IsTikTok(s) {
    if (s.includes('https://www.tiktok.com/'))
        return true;
    if (s.includes('https://vm.tiktok.com/'))
        return true;
    return false;
}
// Message function
function FilterTikTok(msg) {
    return __awaiter(this, void 0, void 0, function* () {
        if (msg.author.bot)
            return;
        const content = msg.content.toLowerCase().trim();
        if (!IsTikTok(content))
            return;
        yield msg.delete();
        yield msg.channel.send(`TIKTOK NOT ALLOWED ${Mention(msg.author)}`);
    });
}
export { Test, IsTikTok, FilterTikTok, Mention, GetRedditTodaysTop, InviteLink, StreamYT };
