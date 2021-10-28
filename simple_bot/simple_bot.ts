import * as Discord from "discord.js";
import {config} from "dotenv";
import { type } from "os";
import {EventHandler} from "../utility/event_handler.js"
import { Mention } from "./utility/util.js";
import * as commands from "./commands/commands.js"
import {DiscordCommand, FilterTikTok} from "./commands/src/tiktok.js"

import ytdl from "ytdl-core"; //youtube system
import fs from "fs" // file-system

//import {EventHandler, Room} from '../utility/classes.js';
//import { TicTacToe } from "../utility/games.js";
config()

// Invite Link: https://discord.com/api/oauth2/authorize?client_id=867508786033590272&permissions=8&scope=bot

let TOKEN = process.env.TOKEN
console.log(TOKEN)
console.log("Hello World")

//type DiscordCommand = (message : Discord.Message, content : string, ...args : unknown[]) => void

class DiscordBot extends Discord.Client{
    commandHandler : EventHandler //handles command requests
    commandPrefix : string = '!'
    prefixes : Map<Discord.Guild, string> = new Map()

    constructor(prefix : string = '.', debug : boolean = true, options : Discord.ClientOptions | null = {ws: { intents: 
        ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 
        'GUILD_PRESENCES', 'GUILD_INTEGRATIONS', 'GUILD_VOICE_STATES', 
        'DIRECT_MESSAGES', 'GUILD_MESSAGE_TYPING', 'GUILD_MESSAGE_REACTIONS']}},
        )
    {
        super(options)
        this.commandPrefix = prefix //prefix should be server specific
        this.commandHandler = new EventHandler()
        this.on("ready", () => {
            this.Setup()
        })

        // Assume all commands have format: (message, content, ...args) => void
        this.addEvent('test', commands.Test)
        this.addEvent('reddit', commands.GetRedditTodaysTop)
        this.addEvent('invite', commands.InviteLink)
        this.addEvent('stream', commands.StreamYT)


        this.addEvent('settings', async (client : Discord.Client, msg : Discord.Message, content : string) => {
            const cntn = content.split(" ")
            const stg = cntn[1] //setting to change
            if (stg == "prefix")
                this.prefixes.set(msg.guild, cntn[2])
                await msg.channel.send(`prefix changed to ${cntn[2]}`)
        })
        this.addEvent('help', async (client : Discord.Client, msg : Discord.Message, cntn : string) => {
            let ret = ""
            for (const k of this.commandHandler.listeners.keys()){
                ret += `${k}`
                ret += "\n"
            }
            await msg.channel.send(ret)
        })
        this.on('message', FilterTikTok)

        //called when the user types typing
        this.on("typingStart", async (chn : Discord.Channel, user) => {
            console.log(`User ${user.username} is typing in channel ${chn.id}`);
        });
    }

    private Setup(debug : boolean = false){
        this.guilds.cache.forEach(guild => {
            console.log("Connected guilds: ", guild.name)
            this.prefixes.set(guild, this.commandPrefix)
        })

        this.voice.connections.forEach(vc => {
            vc.disconnect()
        })

        // Setup command calls
        this.on("message", async (message) => {
            //check the author
            const author = message.author;
            if (author.bot) return;
            const content = message.content.toLowerCase().trim()
            // console.log("guild: ", message.guild.name)
            const call = content.startsWith(this.prefixes.get(message.guild))
            if (debug)  console.log(`[${message.member.displayName}, ${call}] : ${content}`)

            // Assume command message format: "prefix_command ...args"
            if (call) {
                const cntn = content.slice(1) //text without command
                const split = cntn.split(" ") //text seperated into the arguments
                const cmd = split[0]

                if (debug){
                    console.log(`From ${split}: Calling ${cmd}`)
                    console.log(`args: ${content.slice(1)}`)
                }
                try{
                    this.commandHandler.emit(cmd, this, message, ...split.slice(1))
                }
                catch(err){
                    message.reply(`There was an error with the command ${cmd}(${split})`)
                    console.log(err)
                }
            }
        });
    }

    addEvent(eventName : string, callback : DiscordCommand){
        this.commandHandler.addEventListener(eventName, callback)
    }
}
const bot = new DiscordBot()
bot.login(TOKEN)

export {DiscordBot}