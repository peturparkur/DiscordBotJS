var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Gaussian, RandInt } from "../../../utility/putil_maths.js";
import { CommandConstructor } from "../../../discord_utils/comm_class.js";
function get_min_max(...content) {
    let _min = 0;
    let _max = 1;
    if (content.length > 0) {
        if (content.length == 1) {
            try {
                _max = parseInt(content[0]);
            }
            catch (err) {
                console.log(`Error ${err}`);
            }
        }
        if (content.length == 2) {
            try {
                _min = parseInt(content[0]);
                _max = parseInt(content[1]);
            }
            catch (err) {
                console.log(`Error ${err}`);
            }
        }
    }
    return [_min, _max];
}
function _Random(client, message, ...content) {
    return __awaiter(this, void 0, void 0, function* () {
        const bounds = get_min_max(...content);
        const val = RandInt(bounds[0], bounds[1]);
        return message.channel.send(`Random Value : ${val}`);
    });
}
export const Random = CommandConstructor(_Random, "Generate a random integer between given minimum and maximum values", []);
export const Random_Normal = CommandConstructor(_Random_Normal, "Generate a Normal distribution sample with given mean and variance", []);
export const Coin_Toss = CommandConstructor(_Coin_Toss, "Random -> Heads or Tails", []);
export function _Random_Normal(client, message, ...content) {
    return __awaiter(this, void 0, void 0, function* () {
        function get_args(...content) {
            let _mean = 0;
            let _std = 1;
            if (content.length > 0) {
                if (content.length == 1) {
                    try {
                        _mean = parseInt(content[0]);
                    }
                    catch (err) {
                        console.log(`Error ${err}`);
                    }
                }
                if (content.length == 2) {
                    try {
                        _mean = parseInt(content[0]);
                        _std = parseInt(content[1]);
                    }
                    catch (err) {
                        console.log(`Error ${err}`);
                    }
                }
            }
            return [_mean, _std];
        }
        const args = get_args(...content);
        const val = Gaussian(args[0], args[1]);
        return message.channel.send(`Random Value : ${val}`);
    });
}
export function _Coin_Toss(client, message, ...content) {
    return __awaiter(this, void 0, void 0, function* () {
        const val = RandInt(0, 1);
        let msg = "Tails";
        if (val == 1)
            msg = "Heads";
        return message.channel.send(`Coin Toss : ${msg}`);
    });
}
