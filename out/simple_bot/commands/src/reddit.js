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
import { CommandConstructor } from "../../utility/comm_class.js";
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
function IsEmbeded(post) {
    if (post['url_overridden_by_dest'].includes("https://i.redd.it/"))
        return false;
    return true;
}
function IsNSFW(post) {
    if ('over_18' in post) {
        return post['over_18'];
    }
    return false;
}
function Text2Spoiler(text) {
    return "||" + text + "||";
}
export const GetRedditTodaysTop = CommandConstructor(_GetRedditTodaysTop, 'Get a random (or given) random post from Todays top reddit posts', []);
function _GetRedditTodaysTop(client, message, ...content) {
    return __awaiter(this, void 0, void 0, function* () {
        //const cntn = content.split(" ")
        const cntn = content;
        let subreddit = cntn[0];
        let index = cntn.length >= 2 ? parseInt(cntn[1]) : -1;
        //const posts = await GetReddit(subreddit, 100)
        GetReddit(subreddit, 100).then(posts => {
            const todays = FilterTodaysPost(posts);
            if (index < 0) {
                index = Math.floor(Math.random() * todays.length);
            }
            if (todays.length <= 0) {
                message.channel.send(`${message.member.displayName}: No post has been found for today`);
                return;
            }
            const post = todays.length > index ? todays[index] : todays[todays.length - 1];
            const is_video = post['is_video'];
            const is_nsfw = IsNSFW(post);
            //console.log(`IS NSFW : ${is_nsfw}`)
            if (is_video) {
                const loc = post['secure_media']['reddit_video']['fallback_url'];
                const end = loc.split('.')[3];
                //console.log(`${typeof loc} loc ${loc} -> ${loc.includes('.mp4')}`)
                if (loc.includes('.mp4')) {
                    if (loc.size / (1024 * 1024) >= 8) {
                        message.channel.send(`${post['title']}`);
                        message.channel.send(`File size is too large ${loc}`);
                        return;
                    }
                    try {
                        message.channel.send(`${post['title']}`);
                        message.channel.send({ files: [loc] });
                    }
                    catch (err) {
                        console.log(`URL -> ${post['url_overridden_by_dest']}`);
                        console.log(`Failed to send reddit MP4 ${err}`);
                    }
                }
                else {
                    message.channel.send(`Content is not compatible: ${loc}`);
                }
                // const response = await fetch(loc, {method : 'GET', headers : {'User-agent' : 'reddit_discord_bot v0.05'}})
            }
            else {
                if ('url_overridden_by_dest' in post) {
                    const loc = post['url_overridden_by_dest'];
                    // Tries to detect if it's an embeded link
                    // console.log(`Embeded : ${IsEmbeded(post)}`)
                    if (loc.size / (1024 * 1024) >= 8) {
                        message.channel.send(`${post['title']}`);
                        message.channel.send(`File size is too large ${loc}`);
                        return;
                    }
                    if (IsEmbeded(post)) {
                        try {
                            if (is_nsfw) {
                                message.channel.send(`NSFW -- ${post['title']}`);
                                message.channel.send(Text2Spoiler(loc));
                            }
                            else {
                                message.channel.send(`${post['title']}`);
                                message.channel.send(loc);
                            }
                            return;
                        }
                        catch (err) {
                            console.log(`Failed to send embeded reddit post ${err}`);
                            return;
                        }
                    }
                    const end = loc.slice(-3); //loc.split('.')[3]
                    // const response = await fetch(loc, {method : 'GET', headers : {'User-agent' : 'reddit_discord_bot v0.05'}})
                    // const blob = await response.blob()
                    // console.log(response)
                    try {
                        if (is_nsfw) {
                            message.channel.send(`NSFW -- ${post['title']}`);
                            message.channel.send({ files: [{ attachment: loc, name: "SPOILER_FILE." + end }] });
                        }
                        else {
                            message.channel.send(`${post['title']}`);
                            message.channel.send({ files: [loc] });
                        }
                    }
                    catch (err) {
                        console.log(`Failed to send reddit post ${err}`);
                    }
                }
            }
        });
    });
}
