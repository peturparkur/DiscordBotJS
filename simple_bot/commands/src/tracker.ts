import * as Discord from "discord.js";
import { CommandConstructor, ICommand } from "../../../discord_utils/comm_class.js"
import fs from "fs" //file system
import * as schedule from "node-schedule"


const tracker : Map<string, Map<string, number>> = new Map() // number measure UTC milliseconds
const updater : Map<string, number> = new Map()
let started : boolean = false
let last_update : Date = new Date()

function ResetTracker(){
    console.log(`Reset Tracker @${new Date()}`)
    for(const k of tracker.keys()){
        tracker.set(k, new Map<string, number>())
    }
}

/**
 * Starts the tracker -> run on discord bot setup
 * @param client 
 */
export async function StartTracker(client : Discord.Client){
    if (!started){
        console.log('Start tracker')
        last_update = new Date()
        schedule.scheduleJob("tracker_reset", "0 0 * * *", (firedate) => {ResetTracker()})
        LoadTracker()
        //if ((await LoadTrackerData()) === 1){ // loads saved data
            //error
        //}
        client.on('presenceUpdate', (before, after) =>{
            if(!tracker.has(after.user.username))
                return
            return ActivityTracker(before, after)
        })
        started = true
    }
}

async function SaveTracker() {
    console.log('Saving Tracker')
    if (!fs.existsSync("./data")){
        fs.mkdir("./data", (err) =>{})
    }
    const data = JSON.stringify(Array.from(tracker.keys()))
    return fs.writeFile('./data/tracker.json', data, (err) =>{})
}

async function SaveTrackerData(){
    console.log('Saving Tracker with Data')
    if (!fs.existsSync("./data")){
        fs.mkdir("./data", (err) =>{})
    }
    let obj = {}
    for(const k of tracker.keys()){
        const vals = Object.fromEntries(tracker.get(k))
        obj[k] = vals
    }
    const data = JSON.stringify(obj)
    console.log(data)
    return fs.writeFile("./data/tracker_data.json", data, (err) => {})
}

async function LoadTrackerData(){
    if (!fs.existsSync("./data")){
        return 1
    }
    if (!fs.existsSync("./data/tracker_data.json")){
        return 1
    }
    console.log('Loading Tracker')
    fs.readFile('./data/tracker_data.json', (err, data) => {
        let trk = JSON.parse(data.toString())
        tracker.clear()
        for(const k in trk){
            tracker.set(k, new Map<string, number>())
            for(const j in trk[k]){
                tracker.get(k).set(j, trk[k][j])
            }
        }
        console.log(tracker)
        console.log(`Now tracking ${Array.from(tracker.keys())}`)
    })
    return 0
}

async function LoadTracker(){
    if (!fs.existsSync("./data")){
        return
    }
    if (!fs.existsSync("./data/tracker.json")){
        return
    }
    console.log('Loading Tracker')
    fs.readFile('./data/tracker.json', (err, data) => {
        let trk = JSON.parse(data.toString()) as Array<string>
        tracker.clear()
        for(const k of trk){
            tracker.set(k, new Map<string, number>())
        }
        console.log(`Now tracking ${Array.from(tracker.keys())}`)
    })
    return
}

/**
 * Construct Date-like structure from utc number -> interpret as time spent from 0
 * @param dt Time delta
 * @returns \{days, hours, minutes, seconds} : additive
 */
function DeltaTime(dt : number){
    let diffDays = Math.floor(dt / 86400000); // days
    let diffHrs = Math.floor((dt % 86400000) / 3600000); // hours
    let diffMins = Math.round(((dt % 86400000) % 3600000) / 60000); // minutes
    let diffSeconds = Math.round(((dt % 86400000) % 3600000) % 60000) / 1000; // minutes
    return {
        "days" : diffDays,
        "hours" : diffHrs,
        "minutes" : diffMins,
        "seconds" : diffSeconds
    }
}

/**
 * Checks whether or not activities contain playing
 * @param activities activities to check through
 * @returns activity if playing, null otherwise
 */
function playing(activities:Array<Discord.Activity>) : Discord.Activity | null{
    for (const a of activities){
        if (a.type == "PLAYING"){
            return a
        }
    }
    return null
}

function ActivityTracker(before : Discord.Presence, after : Discord.Presence){
    // need both information
    if(!before || !after)
        return

    // Don't update if called in less than 0.5s
    // Used to solve calls from multiple servers
    let v = updater.get(after.user.username)
    if(v){
        if((new Date().getTime() - v) < 500){
            return
        }
    }
    updater.set(after.user.username, new Date().getTime()) //change last updated time
                
    // Check if a new Day has arrived
    const now = new Date()

    // Not tracking this guy
    if(!tracker.has(after.user.username)){
        return
    }
    //console.log(`${after.member.user.username} : status change`)

    const activity = playing(before.activities)
    if(!playing(after.activities) && activity){
        // Was playing -> Now they don't
        //console.log(`${after.member.user.username} : Changed play status!`)
        const prev = tracker.get(after.member.user.username)
        const prev_time = prev.get(activity.name)
        //console.log(activity.timestamps)
        if(activity.timestamps == null){
            console.log(`WEIRD? ${after.user.username} -> Timestamp doesn't exist for ${activity}`)
        }

        const start = activity.timestamps.start

        // Have played previously
        if(prev_time != null){
            let dx = now.getTime() - start.getTime()
            tracker.set(after.member.user.username, 
                prev.set(activity.name, prev_time + dx))
        }
        else{
            tracker.set(after.member.user.username, prev.set(activity.name, 
                now.getTime() - start.getTime()))
        }
        //SaveTrackerData()
    }
}

/**
 * Function to track the playtime of individual clients
 * @param client 
 * @param message 
 * @param content 
 */
async function TrackPlaytime(client : Discord.Client, message : Discord.Message, ...content : string[]) {
    if(!tracker.has(message.member.user.username)){
        tracker.set(message.member.user.username, new Map<string, number>())
        SaveTracker() // saves current tracker files
        return message.channel.send(`Now tracking playtime of ${message.author.username}`)
    }
    return message.channel.send(`Already tracking playtime of ${message.member.user.username}`)
}

/**
 * Function to stop tracking playtime of an individual user
 * @param client 
 * @param message 
 * @param content 
 * @returns 
 */
async function StopTracking(client : Discord.Client, message : Discord.Message, ...content : string[]) {
    tracker.delete(message.member.user.username)
    return message.channel.send(`Stopped tracking playtime of ${message.member.user.username}`)
}

async function CheckPlaytime(client : Discord.Client, message : Discord.Message, ...content : string[]) {
    let user = message.author.username
    if (content.length > 0){
        user = content[0]
    }
    const player = tracker.get(user)
    if(player){
        let games : string = ""
        let sum : number = 0
        player.forEach((timer, activity) =>{
            sum += timer
            let dt = DeltaTime(timer)
            games += `${activity} -> ${dt.hours} hours, ${dt.minutes} minutes, ${dt.seconds} seconds \n`
        })
        let dt = DeltaTime(sum)
        return message.channel.send(`Today ${user} played a total of ${dt.hours} hours, ${dt.minutes} minutes, ${dt.seconds} seconds : \n` + games)
    }
    return message.channel.send(`Not tracking playtime of ${user} or ${user} doesn't exist`)
}

export const PlaytimeTracker = CommandConstructor(
    TrackPlaytime, "Tracks your daily playtime for each game", [])

export const StopPlaytimeTracker = CommandConstructor(
    StopTracking, "Stops tracking your daily playtime for each game", [])

export const CheckPlaytimeTracker = CommandConstructor(
    CheckPlaytime, "Shows your daily playtime for each game", [])