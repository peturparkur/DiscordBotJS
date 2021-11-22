var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CommandConstructor } from "../../utility/comm_class.js";
class Timer {
    constructor(delta = 0, updated = new Date()) {
        this.delta = delta;
        this.last_update = updated;
    }
}
const tracker = new Map(); // number measure UTC milliseconds
const updater = new Map();
let started = false;
let last_update = new Date();
function DeltaTime(dt) {
    let diffDays = Math.floor(dt / 86400000); // days
    let diffHrs = Math.floor((dt % 86400000) / 3600000); // hours
    let diffMins = Math.round(((dt % 86400000) % 3600000) / 60000); // minutes
    let diffSeconds = Math.round(((dt % 86400000) % 3600000) % 60000) / 1000; // minutes
    return {
        "days": diffDays,
        "hours": diffHrs,
        "minutes": diffMins,
        "seconds": diffSeconds
    };
}
function playing(activities) {
    for (const a of activities) {
        if (a.type == "PLAYING") {
            return a;
        }
    }
    return null;
}
function ActivityTracker(message, before, after) {
    let v = updater.get(after.user);
    if (v) {
        if ((new Date().getTime() - v) < 500) {
            return;
        }
    }
    updater.set(after.user, new Date().getTime());
    //console.log(updater)
    if (!before || !after)
        return;
    // Check if a new Day has arrived
    const now = new Date();
    if (DeltaTime(now.getTime() - last_update.getTime()).days >= 1) {
        tracker.forEach((value, key) => {
            tracker.set(key, new Map());
        });
        last_update = now;
    }
    // Not tracking this guy
    if (!tracker.has(after.user)) {
        return;
    }
    const activity = playing(before.activities);
    if (!playing(after.activities) && activity) {
        // Was playing -> Now they don't
        const prev = tracker.get(after.member.user);
        //console.log("tracker : ", tracker)
        const prev_time = prev.get(activity.name);
        //console.log("prev : ", prev)
        //console.log("prev_time : ", prev_time)
        const start = activity.timestamps.start;
        if (prev_time != null) {
            let dx = now.getTime() - start.getTime();
            //console.log(`dt0 : ${dx}`)
            //console.log(`dt0 : ${now} - ${start}`)
            tracker.set(after.member.user, prev.set(activity.name, prev_time + dx));
            //console.log(`dt0 ${activity} -> ${tracker.get(after.member.user).get(activity.name)}`)
        }
        else {
            //console.log(`dt1 : ${now.getTime() - start.getTime()}`)
            //console.log(`dt1 : ${now.getTime()} - ${start.getTime()} || ${now.toUTCString()}`)
            //console.log(`dt1 : ${now} - ${start}`)
            tracker.set(after.member.user, new Map().set(activity.name, now.getTime() - start.getTime()));
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
function TrackPlaytime(client, message, ...content) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!tracker.has(message.member.user)) {
            tracker.set(message.member.user, new Map());
            console.log(`Now tracking playtime of ${message.member.displayName}`);
        }
        if (tracker.size > 0 && !started) {
            client.on('presenceUpdate', (before, after) => {
                if (!tracker.has(after.user))
                    return;
                return ActivityTracker(message, before, after);
            });
            started = true;
        }
        return message.channel.send(`Now tracking playtime of ${message.member.user.username}`);
    });
}
/**
 * Function to stop tracking playtime of an individual user
 * @param client
 * @param message
 * @param content
 * @returns
 */
function StopTracking(client, message, ...content) {
    return __awaiter(this, void 0, void 0, function* () {
        tracker.delete(message.member.user);
        return message.channel.send(`Stopped tracking playtime of ${message.member.user.username}`);
    });
}
function CheckPlaytime(client, message, ...content) {
    return __awaiter(this, void 0, void 0, function* () {
        const player = tracker.get(message.author);
        if (player) {
            let games = "";
            let sum = 0;
            player.forEach((timer, activity) => {
                sum += timer;
                let dt = DeltaTime(timer);
                games += `${activity} -> ${dt.hours} hours, ${dt.minutes} minutes, ${dt.seconds} seconds \n`;
            });
            let dt = DeltaTime(sum);
            return message.channel.send(`Today ${message.author.username} played a total of ${dt.hours} hours, ${dt.minutes} minutes, ${dt.seconds} seconds : \n` + games);
        }
        return message.channel.send(`Not tracking playtime of ${message.member.user.username}`);
    });
}
export const PlaytimeTracker = CommandConstructor(TrackPlaytime, "Tracks your daily playtime for each game", []);
export const StopPlaytimeTracker = CommandConstructor(StopTracking, "Stops tracking your daily playtime for each game", []);
export const CheckPlaytimeTracker = CommandConstructor(CheckPlaytime, "Shows your daily playtime for each game", []);
