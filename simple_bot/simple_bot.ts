import * as Discord from "discord.js";
import {config} from "dotenv";
import { type } from "os";
import {EventHandler} from "../utility/event_handler.js"
import { Mention } from "./utility/util.js";
import * as commands from "./commands/commands.js"
import {FilterTikTok} from "./commands/src/tiktok.js"

import ytdl from "ytdl-core"; //youtube system
import fs from "fs" // file-system
import { Command } from "./utility/comm_class.js";
import { CommandConstructor, ICommand } from "./utility/comm_class.js"

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
        this.addEvent('play', commands.StreamYT)
        this.addEvent('skip', commands.SkipYT)
        this.addEvent('stop', commands.StopYT)
        this.addEvent('playlist', commands.ShowPlaylist)
        this.addEvent('coin', commands.Coin_Toss)
        this.addEvent('random', commands.Random)
        this.addEvent('rand', commands.Random_Normal)
        this.addEvent('function', commands.RandomFunction)
        this.addEvent('track', commands.PlaytimeTracker)
        this.addEvent('check', commands.CheckPlaytimeTracker)
        this.addEvent('stopt', commands.StopPlaytimeTracker)


        this.addEvent('settings', async (client : Discord.Client, msg : Discord.Message, content : string) => {
            const cntn = content.split(" ")
            const stg = cntn[0] //setting to change
            if (stg == "prefix")
                this.prefixes.set(msg.guild, cntn[1])
                await msg.channel.send(`prefix changed to ${cntn[1]}`)
        })
        this.addEvent('help', async (client : Discord.Client, msg : Discord.Message, cntn : string) => {
            let ret = ""
            for (const k of this.commandHandler.listeners.keys()){
                ret += `${k}`
                ret += "\n"
            }
            await msg.channel.send(ret)
        })

        this.addEvent('detail', async (client : Discord.Client, msg : Discord.Message, content : string) => {
            const cntn = content.split(" ")
            const key = cntn[0]
            if (!this.commandHandler.listeners.has(key)){
                await msg.channel.send(`No command found with name ${key}`)
                return
            }
            if(key in ['function', 'track', 'check', 'stopt']) return
            const func = this.commandHandler.listeners.get(key)[0] as ICommand
            let desc = func.toString()
            desc = func.description

            await msg.channel.send(`description of ${key} : ${desc}`)
        })

        this.on('message', FilterTikTok)

        //called when the user types typing
        this.on("typingStart", async (chn : Discord.Channel, user) => {
            console.log(`User ${user.username} is typing in channel ${chn.id}`);
        });

        function playing(activities:Array<Discord.Activity>){
            for (const a of activities){
                if (a.type == "PLAYING"){
                    return a
                }
            }
            return null
        }
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
            const contentRaw = message.content.trim()
            // console.log("guild: ", message.guild.name)
            const call = content.startsWith(this.prefixes.get(message.guild))
            if (debug)  console.log(`[${message.member.displayName}, ${call}] : ${content}`)

            // Assume command message format: "prefix_command ...args"
            if (call) {
                const cntn = contentRaw.slice(1) //text without command
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

    addEvent(eventName : string, callback : Command){
        this.commandHandler.addEventListener(eventName, callback)
    }
}
const bot = new DiscordBot()
bot.login(TOKEN)

export {DiscordBot}