import * as Discord from "discord.js";
import { CommandConstructor, ICommand } from "../../utility/comm_class.js"

class Timer {
    delta : number;
    last_update : Date;

    constructor(delta : number = 0, updated : Date = new Date()){
        this.delta = delta
        this.last_update = updated
    }
}

const tracker : Map<string, Map<string, number>> = new Map() // number measure UTC milliseconds
const updater : Map<string, number> = new Map()
let started : boolean = false
let last_update : Date = new Date()

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

function playing(activities:Array<Discord.Activity>) : Discord.Activity | null{
    for (const a of activities){
        if (a.type == "PLAYING"){
            return a
        }
    }
    return null
}

function ActivityTracker(message : Discord.Message, before : Discord.Presence, after : Discord.Presence){
    let v = updater.get(after.user.username)
    if(v){
        if((new Date().getTime() - v) < 500){
            return
        }
    }
    updater.set(after.user.username, new Date().getTime())
        //console.log(updater)

    if(!before || !after)
        return
                
    // Check if a new Day has arrived
    const now = new Date()

    // Not tracking this guy
    if(!tracker.has(after.user.username)){
        return
    }

    const activity = playing(before.activities)
    if(!playing(after.activities) && activity){
        // Was playing -> Now they don't
        const prev = tracker.get(after.member.user.username)
        //console.log("tracker : ", tracker)
        const prev_time = prev.get(activity.name)
        console.log(activity.timestamps)

        const start = activity.timestamps.start
        if(prev_time != null){
            let dx = now.getTime() - start.getTime()
            //console.log(`dt0 : ${dx}`)
            //console.log(`dt0 : ${now} - ${start}`)
            tracker.set(after.member.user.username, 
                prev.set(activity.name, prev_time + dx))
            //console.log(`dt0 ${activity} -> ${tracker.get(after.member.user).get(activity.name)}`)
        }
        else{
            //console.log(`dt1 : ${now.getTime() - start.getTime()}`)
            //console.log(`dt1 : ${now.getTime()} - ${start.getTime()} || ${now.toUTCString()}`)
            //console.log(`dt1 : ${now} - ${start}`)
            tracker.set(after.member.user.username, prev.set(activity.name, 
                now.getTime() - start.getTime()))
            //console.log(`dt1 ${activity} -> ${tracker.get(after.member.user).get(activity.name)}`)
        }
    }
}

/**
 * Function to track the playtime of individual clients
 * @param client 
 * @param message 
 * @param content 
 */
async function TrackPlaytime(client : Discord.Client, message : Discord.Message, ...content : string[]) {
    const now = new Date()
    if((now.getDate() - last_update.getDate()) > 0){
        tracker.forEach((value, key) =>{
            tracker.set(key, new Map<string, number>())
        })
        last_update = now
    }

    if(!tracker.has(message.member.user.username)){
        tracker.set(message.member.user.username, new Map<string, number>())
        return message.channel.send(`Now tracking playtime of ${message.author.username}`)
    }
    if (tracker.size > 0 && !started){
        last_update = new Date()
        client.on('presenceUpdate', (before, after) =>{
            console.log(`presence change #${after.user.username}`)
            if(!tracker.has(after.user.username))
                return
            console.log(`presence change post #${after.user.username}`)
            return ActivityTracker(message, before, after)
        })
        started = true
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