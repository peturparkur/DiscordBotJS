var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Mention } from "../../utility/util.js";
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
export { IsTikTok, FilterTikTok, Mention };
