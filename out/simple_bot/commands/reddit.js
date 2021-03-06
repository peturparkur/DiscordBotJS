var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
export function GetRedditTodaysTop(client, message, ...content) {
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
