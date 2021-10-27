import * as Discord from "discord.js";
import { config } from "dotenv";
import { EventHandler } from "../utility/event_handler.js";
import { FilterTikTok, Test, GetRedditTodaysTop } from "./commands.js";
//import {EventHandler, Room} from '../utility/classes.js';
//import { TicTacToe } from "../utility/games.js";
config();
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
        this.commandPrefix = prefix;
        this.commandHandler = new EventHandler();
        this.Setup(debug);
        // Assume all commands have format: (message, content, ...args) => void
        this.addEvent('test', Test);
        this.addEvent('reddit', GetRedditTodaysTop);
        this.on('message', FilterTikTok);
        //called when the user types typing
        this.on("typingStart", async (chn, user) => {
            console.log(`User ${user.username} is typing in channel ${chn.id}`);
        });
    }
    Setup(debug = false) {
        // Setup command calls
        this.on("message", async (message) => {
            //check the author
            const author = message.author;
            if (author.bot)
                return;
            const content = message.content.toLowerCase().trim();
            const call = content.startsWith(this.commandPrefix);
            if (debug)
                console.log(`[${message.member.displayName}, ${call}] : ${content}`);
            // Assume command message format: "prefix_command ...args"
            if (call) {
                const cntn = content.slice(1); //text without command
                const split = cntn.split(" "); //text seperated into the arguments
                const cmd = split[0];
                if (debug)
                    console.log(`From ${split}: Calling ${cmd}`);
                this.commandHandler.emit(cmd, message, content.slice(1), split.slice(1));
            }
        });
    }
    addEvent(eventName, callback) {
        this.commandHandler.addEventListener(eventName, callback);
    }
}
const bot = new DiscordBot();
bot.login(TOKEN);
