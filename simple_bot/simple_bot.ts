import * as Discord from "discord.js";
import {config} from "dotenv";
//import { type } from "os";
import {EventHandler} from "../utility/event_handler.js"
import { Mention, Map2Obj, Obj2Map, SaveObjectJson, LoadObjectJson, FileExists } from "../discord_utils/util.js";
import * as commands from "./commands/commands.js"
import {FilterTikTok} from "./commands/src/tiktok.js"

//import ytdl from "ytdl-core"; //youtube system
//import fs from "fs" // file-system
import { Command } from "../discord_utils/comm_class.js";
import { CommandConstructor, ICommand } from "../discord_utils/comm_class.js"

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
    commandPrefix : string = '.'
    prefixes : Map<Discord.Guild, string> = new Map()
    prefix_map : Map<string, string> = new Map() // Create mapping from guild_id -> prefix

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
            //commands.StartTracker(this)
        })

        // Assume all commands have format: (message, content, ...args) => void
        this.addEvent('test', commands.Test)

        this.addEvent('reddit', commands.GetRedditTodaysTop)

        this.addEvent('invite', commands.InviteLink)

        this.addEvent('play', commands.StreamYT)
        this.addEvent('skip', commands.SkipYT)
        this.addEvent('stop', commands.StopYT)
        this.addEvent('playlist', commands.ShowPlaylist)
        this.addEvent('join', commands.JoinVoiceChannel)
        this.addEvent('leave', commands.LeaveVoiceChannel)

        this.addEvent('coin', commands.Coin_Toss)
        this.addEvent('random', commands.Random)
        this.addEvent('rand', commands.Random_Normal)
        this.addEvent('function', commands.RandomFunction)
        //this.addEvent('track', commands.PlaytimeTracker)
        //this.addEvent('check', commands.CheckPlaytimeTracker)
        //this.addEvent('stopt', commands.StopPlaytimeTracker)
        this.addEvent('define', commands.GetDefinition)


        this.addEvent('settings', async (client : Discord.Client, msg : Discord.Message, content : string) => {
            const cntn = content.split(" ")
            const stg = cntn[0] //setting to change
            if (stg == "prefix")
                this.prefixes.set(msg.guild, cntn[1])
                this.prefix_map.set(msg.guild.id, cntn[1])
                console.log(`Saving prefix map success: ${this.SaveSettings()}`)
                await msg.channel.send(`prefix changed to ${cntn[1]}`)
        })
        this.addEvent('help', CommandConstructor(async (client : Discord.Client, msg : Discord.Message, cntn : string) => {

            let ret = "For more detail about a specific command use .detail <command> \n"
            for (const k of this.commandHandler.listeners.keys()){
                ret += `${k}`
                ret += "\n"
            }
            await msg.channel.send(ret)
        }, 'Shows all commands', []))

        this.addEvent('detail', CommandConstructor(async (client : Discord.Client, msg : Discord.Message, content : string) => {
            const cntn = content.split(" ")
            const key = cntn[0]
            if (!this.commandHandler.listeners.has(key)){
                msg.channel.send(`No command found with name ${key}`)
                return
            }
            const func = this.commandHandler.listeners.get(key)[0] as ICommand
            let desc = func.toString()
            desc = func.description

            msg.channel.send(`${key} : ${desc}`)
        }, "Show the description of all the commands", []))

        this.on('message', FilterTikTok)

        //called when the user types typing
        this.on("typingStart", async (chn : Discord.Channel, user) => {
            console.log(`User ${user.username} is typing in channel ${chn.id}`);
        });
    }

    /**
     * Save Command prefix of the bot on a per server basis
     */
    private SaveSettings()
    {
        try {
            return SaveObjectJson(Map2Obj(this.prefix_map), 'prefix_map', './data', true)
        } catch (error) {
            console.log(`Error occured in Saving Object -> ${error}`)
            return false
        }
    }

    private LoadSettings(verbose : boolean = true){
        const obj = LoadObjectJson('prefix_map', './data')
        if(!obj){
            if(verbose) console.log(`Couldn't load prefix settings`)
            return null
        }
        if(verbose) console.log(`Returning loaded object ${obj} to map conversion`)
        return Obj2Map<string>(obj)
    }

    private ExistSettings(verbose : boolean = true){
        if(verbose) console.log(`Checking if prefix_map.json exists`)
        return FileExists('prefix_map.json', './data')
    }

    private Setup(debug : boolean = false){
        this.guilds.cache.forEach(guild => {
            console.log("Connected guilds: ", guild.name)
            this.prefixes.set(guild, this.commandPrefix)
        })

        // Load saved prefix mapping
        if(!this.ExistSettings())
        {
            //this.prefix_map.set(guild.id, this.commandPrefix) // set for each connected guild the default prefix
            this.prefix_map = new Map()
            this.guilds.cache.forEach(guild => {
                this.prefix_map.set(guild.id, this.commandPrefix)
            })
        }
        else
        {
            const map = this.LoadSettings()
            if(map){
                this.prefix_map = new Map(map)
            }
            else{
                // null response couldn't read the mapping
                this.prefix_map = new Map()
                this.guilds.cache.forEach(guild => {
                    this.prefix_map.set(guild.id, this.commandPrefix)
                })
            }
        }

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