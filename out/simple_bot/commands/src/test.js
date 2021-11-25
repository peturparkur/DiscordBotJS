var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CommandConstructor } from "../../utility/comm_class.js";
export const Test = CommandConstructor(_Test, "Test function for testing the connection", []);
function _Test(client, message, ...content) {
    return __awaiter(this, void 0, void 0, function* () {
        return message.channel.send(`received message : ${message.content}`);
    });
}
function Test2(client, message, ...content) {
    return __awaiter(this, void 0, void 0, function* () {
        return message.channel.send(`received message : ${message.content}`);
    });
}
export const RandomFunction = CommandConstructor((client, message, ...content) => __awaiter(void 0, void 0, void 0, function* () {
    return message.channel.send(`received message : ${message.content}`);
}), "Returns a random integer in the given range [min, max] or [0, max]", []);
