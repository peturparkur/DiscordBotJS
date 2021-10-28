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
import { FilterTikTok, Test, GetRedditTodaysTop, InviteLink } from "./commands.js";
//import {EventHandler, Room} from '../utility/classes.js';
//import { TicTacToe } from "../utility/games.js";
config();
// Invite Link: https://discord.com/api/oauth2/authorize?client_id=867508786033590272&permissions=8&scope=bot
let TOKEN = process.env.TOKEN;
console.log(TOKEN);
console.log("Hello World");
//type DiscordCommand = (message : Discord.Message, content : string, ...args : unknown[]) => void
class DiscordBot extends Discord.Client {
    constructor(prefix = '!', debug = true, options = { ws: { intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES',
                'GUILD_PRESENCES', 'GUILD_INTEGRATIONS', 'GUILD_VOICE_STATES',
                'DIRECT_MESSAGES', 'GUILD_MESSAGE_TYPING', 'GUILD_MESSAGE_REACTIONS'] } }) {
        super(options);
        this.commandPrefix = '!';
        this.prefixes = new Map();
        this.commandPrefix = prefix; //prefix should be server specific
        this.commandHandler = new EventHandler();
        this.on("ready", () => {
            this.Setup();
        });
        // Assume all commands have format: (message, content, ...args) => void
        this.addEvent('test', Test);
        this.addEvent('reddit', GetRedditTodaysTop);
        this.addEvent('invite', InviteLink);
        this.addEvent('settings', (msg, content) => __awaiter(this, void 0, void 0, function* () {
            const cntn = content.split(" ");
            const stg = cntn[1]; //setting to change
            if (stg == "prefix")
                this.prefixes.set(msg.guild, cntn[2]);
            yield msg.channel.send(`prefix changed to ${cntn[2]}`);
        }));
        this.addEvent('help', (msg, cntn) => __awaiter(this, void 0, void 0, function* () {
            let ret = "";
            for (const k of this.commandHandler.listeners.keys()) {
                ret += `${k}`;
                ret += "\n";
            }
            yield msg.channel.send(ret);
        }));
        this.on('message', FilterTikTok);
        //called when the user types typing
        this.on("typingStart", (chn, user) => __awaiter(this, void 0, void 0, function* () {
            console.log(`User ${user.username} is typing in channel ${chn.id}`);
        }));
    }
    Setup(debug = false) {
        this.guilds.cache.forEach(guild => {
            console.log("guilds: ", guild.id);
            this.prefixes.set(guild, "!");
        });
        // Setup command calls
        this.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
            //check the author
            const author = message.author;
            if (author.bot)
                return;
            const content = message.content.toLowerCase().trim();
            console.log("guild: ", message.guild.id);
            const call = content.startsWith(this.prefixes.get(message.guild));
            if (debug)
                console.log(`[${message.member.displayName}, ${call}] : ${content}`);
            // Assume command message format: "prefix_command ...args"
            if (call) {
                const cntn = content.slice(1); //text without command
                const split = cntn.split(" "); //text seperated into the arguments
                const cmd = split[0];
                if (debug) {
                    console.log(`From ${split}: Calling ${cmd}`);
                    console.log(`args: ${content.slice(1)}`);
                }
                this.commandHandler.emit(cmd, message, content.slice(1));
            }
        }));
    }
    addEvent(eventName, callback) {
        this.commandHandler.addEventListener(eventName, callback);
    }
}
const bot = new DiscordBot();
bot.login(TOKEN);
