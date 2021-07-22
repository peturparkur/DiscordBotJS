"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var Discord = require("discord.js");
var dotenv_1 = require("dotenv");
console.log("Hello");
dotenv_1.config();
var TOKEN = process.env.TOKEN;
console.log(TOKEN);
function Clamp(x, a, b) {
    if (a === void 0) { a = 0; }
    if (b === void 0) { b = 1; }
    return Math.max(Math.min(x, b), a);
}
var time_to_listen = 60;
var client = new Discord.Client();
var GREETINGS = ["hi", "hello", "hey", "helloo", "yo", "hellooo", "g morning", "gmorning", "good morning",
    "morning", "good day", "good afternoon", "good evening", /*"greetings"*/ , "greeting",
    "good to see you", "its good seeing you", "how are you", "how're you", "how are you doing",
    "how ya doin'", "how ya doin", "how is everything", "how is everything going",
    "how's everything going", "how is you", "how's you", "how are things", "how're things",
    "how is it going", "how's it going", "how's it goin'", "how's it goin", "how is life been treating you",
    "how's life been treating you", "how have you been", "how've you been", "what is up",
    "what's up", "what is cracking", "what's cracking", "what is good", "what's good",
    "what is happening", "what's happening", "what is new", "what's new", "what is neww",
    "g’day", "howdy", "top of the morning to you", "top of the morning to ya"];
var SELF = [
    "bot", "pybot", "ai", "robot", "automation", "computer", "machine", "droid"
];
var LISTENING = new Map(); // who we listen to for commands
var COMMANDS = new Map();
COMMANDS.set("dice roll", function () { return Math.floor(Math.random() * 7); });
// ALL EVENTS: https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584
client.on("ready", function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        console.log("Logged in as " + ((_a = client.user) === null || _a === void 0 ? void 0 : _a.tag));
        client.guilds.cache.each(function (g) { console.log("Joined Guild: " + g.name); });
        return [2 /*return*/];
    });
}); });
//called when a message has been sent
client.on("message", function (message) { return __awaiter(void 0, void 0, void 0, function () {
    var author, norm_content, _a, _b, _i, x, i, _c, SELF_1, y, r, elem;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                author = message.author;
                if (author.bot)
                    return [2 /*return*/];
                /*
                if(message.content.endsWith("bot"))
                {
                    await message.channel.send(`You called me ${message.member.displayName}?`)
                }*/
                if (LISTENING.has(message.member)) {
                    //this person already greeted us => can call functions
                    COMMANDS.forEach(function (func, key) {
                        if (message.content == key) {
                            message.channel.send("<@" + message.author.id + "> : " + func());
                            LISTENING.set(message.member, time_to_listen);
                            return;
                        }
                    });
                }
                norm_content = message.content.toLowerCase();
                _a = [];
                for (_b in GREETINGS)
                    _a.push(_b);
                _i = 0;
                _d.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 6];
                x = _a[_i];
                i = parseInt(x);
                _c = 0, SELF_1 = SELF;
                _d.label = 2;
            case 2:
                if (!(_c < SELF_1.length)) return [3 /*break*/, 5];
                y = SELF_1[_c];
                if (!norm_content.includes(GREETINGS[i] + " " + y)) return [3 /*break*/, 4];
                console.log("We heard a greeting");
                r = Clamp(i + Math.floor(Math.random() * 3), 0, GREETINGS.length - 1);
                elem = GREETINGS[r];
                return [4 /*yield*/, message.channel.send(elem + " " + message.member.displayName)];
            case 3:
                _d.sent();
                console.log("Start listening to " + message.member.displayName);
                LISTENING.set(message.member, time_to_listen); //we will listen to this person for 60 seconds
                return [3 /*break*/, 5];
            case 4:
                _c++;
                return [3 /*break*/, 2];
            case 5:
                _i++;
                return [3 /*break*/, 1];
            case 6:
                console.log(author.username + " aka. " + message.member.displayName + " sent msg " + message.content + " in channel " + message.channel.id);
                return [2 /*return*/];
        }
    });
}); });
//called when the user types typing
client.on("typingStart", function (chn, user) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log("User " + user.username + " is typing in channel " + chn.id);
        return [2 /*return*/];
    });
}); });
//Called when someone joins or leaves a voice channel
//member is the user
client.on("voiceStateUpdate", function (before, after) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log(((before.member != null) ? before.member.displayName : "Null") + " => " + ((after.member != null) ? after.member.displayName : "Null"));
        console.log(((before.channel != null) ? before.channel.name : "Null") + " => " + ((after.channel != null) ? after.channel.name : "Null"));
        return [2 /*return*/];
    });
}); });
//Called when the member starts/stops speaking
client.on("guildMemberSpeaking", function (member, speaking) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log("The server member " + member.displayName + " is speaking " + speaking);
        return [2 /*return*/];
    });
}); });
//Called when the member changes themselves eg.: role, nickname, etc
client.on("guildMemberUpdate", function (before, after) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log("Member " + before.displayName + " : " + before.displayName + " changed their profile");
        console.log("Member " + after.displayName + " : " + after.displayName + " changed their profile");
        return [2 /*return*/];
    });
}); });
//Called when a user's details are changed
client.on("userUpdate", function (oldUser, newUser) {
    console.log("user's details (e.g. username) are changed");
});
var countdown = setInterval(function () {
    LISTENING.forEach(function (x, key) {
        LISTENING.set(key, x - 1);
        if (x <= 0) {
            console.log("Stop listening to " + key.displayName);
            LISTENING["delete"](key);
        }
    });
}, 1 * 1000); //1000 milliseconds
client.login(TOKEN);
