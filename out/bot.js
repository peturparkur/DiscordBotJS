var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as Discord from "discord.js";
import { config } from "dotenv";
import { EventHandler, Room } from './utility/classes.js';
import { TicTacToe } from "./utility/games.js";
console.log("Hello");
config();
let TOKEN = process.env.TOKEN;
console.log(TOKEN);
function Clamp(x, a = 0, b = 1) {
    return Math.max(Math.min(x, b), a);
}
let time_to_listen = 60 * 5; //in seconds
const client = new Discord.Client({ ws: { intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES',
            'GUILD_PRESENCES', 'GUILD_INTEGRATIONS', 'GUILD_VOICE_STATES',
            'DIRECT_MESSAGES', 'GUILD_MESSAGE_TYPING', 'GUILD_MESSAGE_REACTIONS']
    }
});
let GREETINGS = ["hi", "hello", "hey", "helloo", "yo", "hellooo", "g morning", "gmorning", "good morning",
    "morning", "good day", "good afternoon", "good evening", /*"greetings"*/ , "greeting",
    "good to see you", "its good seeing you", "how are you", "how're you", "how are you doing",
    "how ya doin'", "how ya doin", "how is everything", "how is everything going",
    "how's everything going", "how is you", "how's you", "how are things", "how're things",
    "how is it going", "how's it going", "how's it goin'", "how's it goin", "how is life been treating you",
    "how's life been treating you", "how have you been", "how've you been", "what is up",
    "what's up", "what is cracking", "what's cracking", "what is good", "what's good",
    "what is happening", "what's happening", "what is new", "what's new", "what is new",
    "g’day", "howdy", "top of the morning to you", "top of the morning to ya"];
let SELF = [
    "bot", "pybot", "ai", "robot", "automation", "computer", "machine", "droid"
];
class Reminder {
    constructor(name, date) {
        this.name = name;
        this.time = date;
    }
}
let GameRooms = new Array();
let REMINDERS = new Map();
let LISTENING = new Map(); // who we listen to for commands
class CommandHandler extends EventHandler {
    dispatchCommand(type, message, ...args) {
        var _a, _b;
        if (!this.listeners.has(type)) // No Event with this name
            return 1;
        if (args.length > 0) {
            (_a = this.listeners.get(type)) === null || _a === void 0 ? void 0 : _a.forEach((func) => { func.call(this, message, args); }); //call all functions
        }
        else {
            (_b = this.listeners.get(type)) === null || _b === void 0 ? void 0 : _b.forEach((func) => { func.call(this, message); }); //call all functions
        }
        return 0;
    }
}
const CommandListener = new CommandHandler();
// Commands
CommandListener.addEventListener('image', (msg) => {
    //msg.channel.send('response', {files : './image.png'})
    msg.channel.send('Test', { files: ['./image.png'] });
});
CommandListener.addEventListener('dice roll', (msg) => {
    msg.channel.send(`Dice Roll: ${Math.floor(Math.random() * 7)}`);
});
CommandListener.addEventListener('play', (msg) => {
    let message = msg.content.toLowerCase().split(" ");
    //console.log("Message content: ", message);
    message = message.slice(1, message.length); //the remaining stuff besides play
    //console.log("Message: ", message);
    if (message[0] === "tictactoe") {
        let room = new Room([msg.member]);
        GameRooms.push(room);
        room.game = new TicTacToe(3, 3);
        room.addEventListener('message', (args) => {
            //console.log("Arguments: ", args);
            //console.log("Arguments[0]: ", args[0]);
            let member = args[0];
            let content = args[1];
            //console.log("Member: ", member)
            //console.log("Content: ", content)
            console.log(`Received Message ${content} from ${member.nickname}`);
        });
        msg.channel.send("Created TicTacToe Room");
    }
});
const COMMANDS = new Map();
//COMMANDS.set("dice roll", () => {return Math.floor(Math.random() * 7)});
//COMMANDS.set("image", () => {
//    let attach = new Discord.MessageAttachment('./image.png');
//    return attach;
//});
//COMMANDS.set("set reminder", (member : Discord.GuildMember, name : string, date : Date) => {REMINDERS.set(member, new Reminder(name, date))})
//let VoiceStateManagers = new Array<Discord.VoiceStateManager>();
// ALL EVENTS: https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584
client.on("ready", () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(`Logged in as ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}`);
    client.guilds.cache.each(g => { console.log(`Joined Guild: ${g.name}`); });
    //client.guilds.cache.each(g =>{VoiceStateManagers.push(g.voiceStates)});
}));
//called when a message has been sent
client.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
    //check the author
    let author = message.author;
    if (author.bot)
        return;
    //If we're listening to this person's commands
    if (LISTENING.has(message.member)) {
        let words = message.content.toLowerCase().split(' ');
        let r = CommandListener.dispatchCommand(words[0], message); //send the command event
        //Tell Each gameRoom that this person has messaged
        GameRooms.forEach(element => {
            if (!element.HasMember(message.member))
                return;
            element.dispatchEvent('message', message.member, message.content.toLowerCase());
        });
        if (r === 0)
            LISTENING.set(message.member, time_to_listen); //if it was succesful => keep listening to this person
    }
    let norm_content = message.content.toLowerCase();
    for (let x in GREETINGS) {
        let i = parseInt(x);
        for (let y of SELF) {
            if (norm_content.includes(`${GREETINGS[i]} ${y}`)) {
                console.log("We heard a greeting");
                let r = Clamp(i + Math.floor(Math.random() * 3), 0, GREETINGS.length - 1);
                //let elem = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
                let elem = GREETINGS[r];
                yield message.channel.send(`${elem} ${message.member.displayName}`);
                console.log(`Start listening to ${message.member.displayName}`);
                LISTENING.set(message.member, time_to_listen); //we will listen to this person for 60 seconds
                break;
            }
        }
    }
    console.log(`${author.username} aka. ${message.member.displayName} sent msg ${message.content} in channel ${message.channel.id}`);
}));
//called when the user types typing
client.on("typingStart", (chn, user) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`User ${user.username} is typing in channel ${chn.id}`);
}));
//Called when someone joins or leaves a voice channel
//member is the user
client.on("voiceStateUpdate", (before, after) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('---------------');
    console.log(`${(before.member != null) ? before.member.displayName : "Null"} => ${(after.member != null) ? after.member.displayName : "Null"}`);
    console.log(`${(before.channel != null) ? before.channel.name : "Null"} => ${(after.channel != null) ? after.channel.name : "Null"}`);
    console.log(`Video on? => ${after.member.voice.selfVideo}`);
    console.log(`Streaming? => ${after.member.voice.streaming}`);
    console.log('---------------');
}));
//Called when the member starts/stops speaking
client.on("guildMemberSpeaking", (member, speaking) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`The server member ${member.displayName} is speaking ${speaking}`);
}));
//Called when the member changes themselves eg.: role, nickname, etc
client.on("guildMemberUpdate", (before, after) => __awaiter(void 0, void 0, void 0, function* () {
    //console.log(`Member ${before.displayName} : ${before.displayName} changed their profile`);
    console.log(`Member ${after.displayName} changed their profile`);
}));
//Called when a user's details are changed
client.on("userUpdate", (oldUser, newUser) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`user's details (e.g. username) are changed`);
}));
// presenceUpdate
/* Emitted whenever a guild member's presence changes, or they change one of their details.
PARAMETER    TYPE               DESCRIPTION
oldMember    GuildMember        The member before the presence update
newMember    GuildMember        The member after the presence update    */
client.on("presenceUpdate", (oldMember, newMember) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("presence update");
    //clientStatus => desktop, mobile, web
    let date = new Date();
    let timeString = date.getHours() + "h :" + date.getMinutes() + "m :" + date.getSeconds() + "s @ " + date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    console.log(`the guild member ${newMember.member.displayName} at time ${timeString} presence changes from [${(oldMember != null) ? oldMember.activities : "Null"}, ${(oldMember != null) ? oldMember.clientStatus : "Null"}, ${(oldMember != null) ? oldMember.status : "Null"}] => [${newMember.activities}, ${newMember.clientStatus}, ${newMember.status}]`);
}));
//client.guilds.cache.each(guild => {guild.members.cache.each(member => {member.client.on("presenceUpdate", (before, after) =>{console.log(`Presence update ${after.member.displayName}`)})})});
const countdown = setInterval(() => {
    LISTENING.forEach((x, key) => {
        LISTENING.set(key, x - 1);
        if (x <= 0) {
            console.log(`Stop listening to ${key.displayName}`);
            LISTENING.delete(key);
        }
    });
}, 1 * 1000); //1000 milliseconds = 1 second
client.login(TOKEN);
