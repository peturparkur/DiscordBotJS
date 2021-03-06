var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { INVITE_LINK } from "../../constants.js";
import { CommandConstructor } from "../../../discord_utils/comm_class.js";
export const InviteLink = CommandConstructor(_InviteLink, "Returns the invite link of the bot", []);
function _InviteLink(client, message) {
    return __awaiter(this, void 0, void 0, function* () {
        return message.channel.send(`${message.member.displayName} here is the invite link: ${INVITE_LINK}`);
    });
}
