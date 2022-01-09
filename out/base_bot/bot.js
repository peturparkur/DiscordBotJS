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
import { CommandConstructor } from "../discord_utils/comm_class.js";
import { FileExists, LoadObjectJson, Map2Obj, Obj2Map, SaveObjectJson } from "../discord_utils/util.js";
import { EventHandler } from "../utility/event_handler.js";
//import {EventHandler, Room} from '../utility/classes.js';
//import { TicTacToe } from "../utility/games.js";
//config() // used for loading api keys in memory
// Invite Link: https://discord.com/api/oauth2/authorize?client_id=867508786033590272&permissions=8&scope=bot
//let TOKEN = process.env.TOKEN
//console.log(`Hello World ${TOKEN}`)
//type DiscordCommand = (message : Discord.Message, content : string, ...args : unknown[]) => void
export class BaseDiscordBot extends Discord.Client {
    constructor(prefix = '.', save_path = "./data", debug = true, options = { ws: { intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES',
                'GUILD_PRESENCES', 'GUILD_INTEGRATIONS', 'GUILD_VOICE_STATES',
                'DIRECT_MESSAGES', 'GUILD_MESSAGE_TYPING', 'GUILD_MESSAGE_REACTIONS'] } }) {
        super(options);
        this.commandPrefix = '.';
        this.settings = {
            'prefix_map': new Map()
        };
        this.commandPrefix = prefix; //prefix should be server specific
        this.commandHandler = new EventHandler();
        this.settings['prefix_map'] = new Map();
        this.settings['save_path'] = save_path;
        this.on("ready", () => {
            this.Setup();
            //commands.StartTracker(this)
        });
        this.addEvent('settings', CommandConstructor((client, msg, content) => __awaiter(this, void 0, void 0, function* () {
            const cntn = content.split(" ");
            const stg = cntn[0]; //setting to change
            if (stg == "prefix")
                this.prefix_map.set(msg.guild.id, cntn[1]);
            console.log(`Saving prefix map success: ${this.SaveSettings()}`);
            yield msg.channel.send(`prefix changed to ${cntn[1]}`);
        }), "Change bot settings", []));
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
        //called when the user types typing
        this.on("typingStart", (chn, user) => __awaiter(this, void 0, void 0, function* () {
            console.log(`User ${user.username} is typing in channel ${chn.id}`);
        }));
    }
    //prefix_map : Map<string, string> = new Map() // Create mapping from guild_id -> prefix
    get prefix_map() {
        return this.settings['prefix_map'];
    }
    set prefix_map(x) {
        this.settings['prefix_map'] = x;
    }
    AddCommands(commands) {
        for (const [ev, command] of commands) {
            try {
                this.addEvent(ev, command);
            }
            catch (error) {
                console.log(error);
            }
        }
    }
    /**
     * Save Command prefix of the bot on a per server basis
     */
    SaveSettings() {
        try {
            return SaveObjectJson(Map2Obj(this.prefix_map), 'prefix_map', this.settings['save_path'], true);
        }
        catch (error) {
            console.log(`Error occured in Saving Object -> ${error}`);
            return false;
        }
    }
    LoadSettings(verbose = true) {
        const obj = LoadObjectJson('prefix_map', this.settings['save_path']);
        if (!obj) {
            if (verbose)
                console.log(`Couldn't load prefix settings`);
            return null;
        }
        if (verbose)
            console.log(`Returning loaded object ${obj} to map conversion`);
        return Obj2Map(obj);
    }
    ExistSettings(verbose = true) {
        if (verbose)
            console.log(`Checking if prefix_map.json exists`);
        return FileExists('prefix_map.json', this.settings['save_path']);
    }
    Setup(debug = false) {
        this.guilds.cache.forEach(guild => {
            console.log("Connected guilds: ", guild.name);
        });
        // Load saved prefix mapping
        if (!this.ExistSettings()) {
            //this.prefix_map.set(guild.id, this.commandPrefix) // set for each connected guild the default prefix
            this.prefix_map = new Map();
            this.guilds.cache.forEach(guild => {
                this.prefix_map.set(guild.id, this.commandPrefix);
            });
        }
        else {
            const map = this.LoadSettings();
            if (map) {
                this.prefix_map = new Map(map);
            }
            else {
                // null response couldn't read the mapping
                this.prefix_map = new Map();
                this.guilds.cache.forEach(guild => {
                    this.prefix_map.set(guild.id, this.commandPrefix);
                });
            }
        }
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
            const call = content.startsWith(this.prefix_map.get(message.guild.id));
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
    Start(token) {
        return this.login(token);
    }
}
