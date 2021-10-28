var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import ytdl from "ytdl-core"; //youtube system
import yts from "yt-search";
export function StreamYT(client, message, ...content) {
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
        const dispatcher = vcConn.play(vd, { seek: 0, volume: 1 }).on("finish", () => {
            dispatcher.end();
            vc.leave();
        });
        yield message.channel.send(`Playing ${url}`);
    });
}
