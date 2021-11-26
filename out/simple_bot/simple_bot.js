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
import { EventHandler } from "../utility/event_handler.js";
import * as commands from "./commands/commands.js";
import { FilterTikTok } from "./commands/src/tiktok.js";
import { CommandConstructor } from "./utility/comm_class.js";
//import {EventHandler, Room} from '../utility/classes.js';
//import { TicTacToe } from "../utility/games.js";
config();
// Invite Link: https://discord.com/api/oauth2/authorize?client_id=867508786033590272&permissions=8&scope=bot
let TOKEN = process.env.TOKEN;
console.log(TOKEN);
console.log("Hello World");
//type DiscordCommand = (message : Discord.Message, content : string, ...args : unknown[]) => void
class DiscordBot extends Discord.Client {
    constructor(prefix = '.', debug = true, options = { ws: { intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES',
                'GUILD_PRESENCES', 'GUILD_INTEGRATIONS', 'GUILD_VOICE_STATES',
                'DIRECT_MESSAGES', 'GUILD_MESSAGE_TYPING', 'GUILD_MESSAGE_REACTIONS'] } }) {
        super(options);
        this.commandPrefix = '!';
        this.prefixes = new Map();
        this.commandPrefix = prefix; //prefix should be server specific
        this.commandHandler = new EventHandler();
        this.on("ready", () => {
            this.Setup();
            commands.StartTracker(this);
        });
        // Assume all commands have format: (message, content, ...args) => void
        this.addEvent('test', commands.Test);
        this.addEvent('reddit', commands.GetRedditTodaysTop);
        this.addEvent('invite', commands.InviteLink);
        this.addEvent('play', commands.StreamYT);
        this.addEvent('skip', commands.SkipYT);
        this.addEvent('stop', commands.StopYT);
        this.addEvent('playlist', commands.ShowPlaylist);
        this.addEvent('coin', commands.Coin_Toss);
        this.addEvent('random', commands.Random);
        this.addEvent('rand', commands.Random_Normal);
        this.addEvent('function', commands.RandomFunction);
        this.addEvent('track', commands.PlaytimeTracker);
        this.addEvent('check', commands.CheckPlaytimeTracker);
        this.addEvent('stopt', commands.StopPlaytimeTracker);
        this.addEvent('settings', (client, msg, content) => __awaiter(this, void 0, void 0, function* () {
            const cntn = content.split(" ");
            const stg = cntn[0]; //setting to change
            if (stg == "prefix")
                this.prefixes.set(msg.guild, cntn[1]);
            yield msg.channel.send(`prefix changed to ${cntn[1]}`);
        }));
        this.addEvent('help', CommandConstructor((client, msg, cntn) => __awaiter(this, void 0, void 0, function* () {
            let ret = "For more detail about a specific command use .detail <command> \n";
            for (const k of this.commandHandler.listeners.keys()) {
                ret += `${k}`;
                ret += "\n";
            }
            yield msg.channel.send(ret);
        }), 'Shows all commands', []));
        this.addEvent('detail', CommandConstructor((client, msg, content) => __awaiter(this, void 0, void 0, function* () {
            const cntn = content.split(" ");
            const key = cntn[0];
            if (!this.commandHandler.listeners.has(key)) {
                msg.channel.send(`No command found with name ${key}`);
                return;
            }
            const func = this.commandHandler.listeners.get(key)[0];
            let desc = func.toString();
            desc = func.description;
            msg.channel.send(`${key} : ${desc}`);
        }), "Show the description of all the commands", []));
        this.on('message', FilterTikTok);
        //called when the user types typing
        this.on("typingStart", (chn, user) => __awaiter(this, void 0, void 0, function* () {
            console.log(`User ${user.username} is typing in channel ${chn.id}`);
        }));
    }
    Setup(debug = false) {
        this.guilds.cache.forEach(guild => {
            console.log("Connected guilds: ", guild.name);
            this.prefixes.set(guild, this.commandPrefix);
        });
        this.voice.connections.forEach(vc => {
            vc.disconnect();
        });
        // Setup command calls
        this.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
            //check the author
            const author = message.author;
            if (author.bot)
                return;
            const content = message.content.toLowerCase().trim();
            const contentRaw = message.content.trim();
            // console.log("guild: ", message.guild.name)
            const call = content.startsWith(this.prefixes.get(message.guild));
            if (debug)
                console.log(`[${message.member.displayName}, ${call}] : ${content}`);
            // Assume command message format: "prefix_command ...args"
            if (call) {
                const cntn = contentRaw.slice(1); //text without command
                const split = cntn.split(" "); //text seperated into the arguments
                const cmd = split[0];
                if (debug) {
                    console.log(`From ${split}: Calling ${cmd}`);
                    console.log(`args: ${content.slice(1)}`);
                }
                try {
                    this.commandHandler.emit(cmd, this, message, ...split.slice(1));
                }
                catch (err) {
                    message.reply(`There was an error with the command ${cmd}(${split})`);
                    console.log(err);
                }
            }
        }));
    }
    addEvent(eventName, callback) {
        this.commandHandler.addEventListener(eventName, callback);
    }
}
const bot = new DiscordBot();
bot.login(TOKEN);
export { DiscordBot };
