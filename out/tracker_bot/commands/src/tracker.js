var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CommandConstructor } from "../../../discord_utils/comm_class.js";
import fs from "fs"; //file system
import * as schedule from "node-schedule";
import { DeltaTime, LoadObjectJson, Map2Obj, Obj2Map, SaveObjectJson } from "../../../discord_utils/util.js";
export class Tracker {
    /**
     *
     * @param tracker user_id -> {game -> playtime}
     * @param names username -> user_id
     * @param deltas user_id -> last_update
     */
    constructor(save_path = "./tracker_data", tracker = new Map(), names = new Map(), deltas = new Map()) {
        /**
         * Is tracker started
         */
        this.started = false;
        /**
         * user_id -> {game -> playtime}
         */
        this.tracker = new Map();
        /**
         * user_id -> {game -> playtime}
         */
        this.last_update = new Map();
        /**
         * username -> user_id
         */
        this.names = new Map();
        /**
         * user_id -> last_update
         */
        this.deltas = new Map();
        this.save_path = "./tracker_data";
        this.save_path = save_path;
        this.tracker = tracker;
        this.deltas = deltas;
        this.names = names;
        this.started = false;
        this.last_update = new Map();
        this.names = new Map();
        this.clearjob = schedule.scheduleJob("tracker_reset", "0 0 * * *", (_date) => {
            console.log("Clear Job called on");
            this.Clear();
            this.Save();
        });
        this.clearjob = schedule.scheduleJob("tracker_reset", "10 * * * *", (_date) => {
            console.log("Clear minute Job called on");
            this.Clear();
            this.Save();
        });
        console.log("Next clearjob callback => " + this.clearjob.nextInvocation().toString());
    }
    /**
     * Starts the tracker -> run on discord bot setup
     * @param client
     */
    Start(client, verbose = true) {
        if (this.started)
            return;
        if (verbose)
            console.log('Start tracker');
        //console.log('Load data')
        this.Load();
        console.log('Loaded');
        //if ((await LoadTrackerData()) === 1){ // loads saved data
        //error
        //}
        client.on('presenceUpdate', (before, after) => {
            if (!this.tracker.has(after.user.id))
                return;
            return this.TrackActivity(before, after);
        });
        this.started = true;
        if (verbose)
            console.log(this);
    }
    Print() {
        console.log("Tracker");
        console.log(this.tracker);
        for (const [k, x] of this.tracker.entries()) {
            console.log(x);
        }
        console.log("Names");
        console.log(this.names);
        console.log("Deltas");
        console.log(this.deltas);
        console.log("Last Update");
        console.log(this.last_update);
        for (const [k, x] of this.last_update.entries()) {
            console.log(x);
        }
    }
    Clear() {
        for (const [k, x] of this.tracker.entries()) {
            x.clear();
        }
        this.names;
        for (const [k, x] of this.deltas.entries()) {
            this.deltas.set(k, 0);
        }
        for (const [k, x] of this.last_update.entries()) {
            x.clear();
        }
    }
    Track(user) {
        if (!this.tracker.has(user.id)) {
            this.tracker.set(user.id, new Map());
            this.last_update.set(user.id, new Map());
            this.names.set(user.username, user.id);
            //SaveTracker(tracker) // saves current tracker files
            //return message.channel.send(`Now tracking playtime of ${user.username}`)
            this.Save();
            return 0; // now tracking
        }
        return 1; // already tracking
    }
    Save(path = this.save_path, verbose = true) {
        if (verbose)
            console.log('Saving Tracker');
        if (!fs.existsSync(path)) {
            fs.mkdir(path, (err) => { });
        }
        const data = {};
        for (const [k, x] of this.tracker.entries()) {
            data[k] = Map2Obj(x);
        }
        SaveObjectJson(data, "playtime", path, true);
        SaveObjectJson(Map2Obj(this.names), "names", path, true);
        SaveObjectJson(Map2Obj(this.deltas), "deltas", path, true);
        for (const [k, x] of this.last_update.entries()) {
            data[k] = Map2Obj(x);
        }
        SaveObjectJson(data, 'last_update', path, true);
    }
    Load(path = this.save_path) {
        this.Clear();
        let obj = LoadObjectJson("playtime", path);
        let map = Obj2Map(obj);
        if (!map)
            return;
        for (const [k, x] of map.entries()) {
            if (!x) {
                this.last_update.set(k, new Map());
                continue;
            }
            this.tracker.set(k, Obj2Map(x));
        }
        this.names = Obj2Map(LoadObjectJson("names", path));
        this.deltas = Obj2Map(LoadObjectJson("deltas", path));
        map = Obj2Map(LoadObjectJson('last_update', path));
        if (map) {
            for (const [k, x] of map.entries()) {
                if (!x) {
                    this.last_update.set(k, new Map());
                    continue;
                }
                this.last_update.set(k, Obj2Map(x));
            }
        }
        //this.Print()
    }
    AddPlaytime(user, activity, verbose = true) {
        const now = new Date().getTime();
        // Was playing -> Now they don't
        //console.log(`${after.member.user.username} : Changed play status!`)
        if (this.tracker.get(user.id) === undefined) {
            this.tracker.set(user.id, new Map());
        }
        const prev = this.tracker.get(user.id);
        const prev_time = prev.get(activity.name);
        if (this.last_update.get(user.id) === undefined) {
            this.last_update.set(user.id, new Map());
        }
        const prev_update = this.last_update.get(user.id);
        const prev_update_time = prev_update.get(activity.name); //last playtime update of this activity name
        //console.log(activity.timestamps)
        if (activity.timestamps == null) {
            if (verbose)
                console.log(`WEIRD? ${user.username} -> Timestamp doesn't exist for ${activity}`);
            return 1;
        }
        const startT = prev_update_time ? Math.max(activity.timestamps.start.getTime(), prev_update_time) : activity.timestamps.start.getTime();
        console.log(`startT: prev ${prev_update_time} ~~ ${activity.timestamps.start.getTime()}`);
        // Have played previously
        let dx = now - startT;
        if (dx < 0) {
            console.log(`Delta < 0 : ${dx}`);
            dx = 0;
        }
        if (prev_time != null) {
            this.tracker.set(user.id, prev.set(activity.name, prev_time + dx));
            if (verbose) {
                console.log(`Existing ${user.username} => ${activity.name} : [${dx}]`);
                console.log(`Existing ${user.username} => ${activity.name} : [[${DeltaTime(prev_time).raw}, ${DeltaTime(prev_time).minutes}], ${new Date(startT).toString()}, ${new Date(now).toString()}] => ${DeltaTime(dx).raw}`);
            }
        }
        else {
            this.tracker.set(user.id, prev.set(activity.name, dx));
            if (verbose) {
                console.log(`Existing ${user.username} => ${activity.name} : [${dx}]`);
                console.log(`New ${user.username} => ${activity.name} : [[${DeltaTime(prev_time).raw}, ${DeltaTime(prev_time).minutes}], ${new Date(startT).toString()}, ${new Date(now).toString()}] => ${DeltaTime(dx).raw}`);
            }
        }
        // update last update time
        this.last_update.set(user.id, prev_update.set(activity.name, new Date().getTime()));
        this.Save();
        return 0;
    }
    TrackActivity(before, after, verbose = true) {
        if (!this.started)
            return;
        // need both information
        if (!before || !after)
            return;
        const now = new Date().getTime();
        const user = after.member.user;
        let v = this.deltas.get(user.id);
        if (v) {
            if ((now - v) < 500) {
                return;
            }
        }
        this.deltas.set(user.id, now); //change last updated time
        const activity = IsPlaying(before.activities);
        if (IsPlaying(after.activities) && !activity) {
            const a = IsPlaying(after.activities);
            console.log(`${user.username} started playing ${a.name} @${a.createdAt}`);
        }
        if (!IsPlaying(after.activities) && activity) {
            const r = this.AddPlaytime(user, activity, verbose);
            if (r == 1)
                console.log(`Something went wrong in playtime[@${new Date().toDateString()}] for ${user.username} : ${activity.name} @${activity.createdAt}`);
            /*
            // Was playing -> Now they don't
            //console.log(`${after.member.user.username} : Changed play status!`)
            const prev = this.tracker.get(user.id)
            const prev_time = prev.get(activity.name)
            //console.log(activity.timestamps)
            if(activity.timestamps == null){
                if (verbose)
                    console.log(`WEIRD? ${user.username} -> Timestamp doesn't exist for ${activity}`)
                return
            }

            const startT = activity.timestamps.start.getTime()

            // Have played previously
            if(prev_time != null){
                let dx = now - startT
                this.tracker.set(user.id,
                    prev.set(activity.name, prev_time + dx))
                if(verbose)
                    console.log(`${user.username} => ${activity.name} : [${prev_time}, ${startT}, ${now}] => ${DeltaTime(dx)}`)
            }
            else{
                this.tracker.set(user.id,
                    prev.set(activity.name, now - startT))
                if(verbose)
                    console.log(`${user.username} => ${activity.name} : [${prev_time}, ${startT}, ${now}] => ${DeltaTime(now - startT)}`)
            }
            */
        }
    }
    This() {
        return this;
    }
}
export const tracker = new Tracker();
/**
 * Function to track the playtime of individual clients
 * @param client
 * @param message
 * @param content
*/
function TrackPlaytime(_tracker, client, message, ...content) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!_tracker.tracker.has(message.author.id)) {
            _tracker.tracker.set(message.author.id, new Map());
            _tracker.names.set(message.author.username, message.author.id);
            //SaveTracker(tracker) // saves current tracker files
        }
        if (_tracker.Track(message.author) == 0)
            return message.channel.send(`Now tracking playtime of ${message.author.username}`);
        else
            return message.channel.send(`Already tracking playtime of ${message.member.user.username}`);
    });
}
/**
 * Shows playtime of a person
 * @param client
 * @param message
 * @param content
 * @returns
 */
function CheckPlaytime(_tracker, client, message, ...content) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = message.author;
        let name = user.username;
        if (content.length > 0) {
            name = content[0];
        }
        //_tracker.Print();
        user = message.guild.members.cache.get(_tracker.names.get(name)).user;
        const activity = IsPlaying(user.presence.activities);
        if (activity) {
            console.log(`${user.username} is playing ${activity.name} => add playtime`);
            _tracker.AddPlaytime(user, activity, true);
        }
        else {
            console.log(`${user.username} is not playing`);
        }
        if (!_tracker.names) {
            return message.channel.send(`Not Tracking @${name}`);
        }
        const player = _tracker.tracker.get(_tracker.names.get(name));
        if (player) {
            let games = "";
            let sum = 0;
            player.forEach((timer, activity) => {
                sum += timer;
                let dt = DeltaTime(timer);
                games += `${activity} -> ${dt.hours} hours, ${dt.minutes} minutes, ${dt.seconds} seconds => ${timer / 1000}s \n`;
            });
            let dt = DeltaTime(sum);
            return message.channel.send(`Today ${name} played a total of ${dt.hours} hours, ${dt.minutes} minutes, ${dt.seconds} seconds => ${sum / 1000}s : \n` + games);
        }
        return message.channel.send(`Not tracking playtime of ${name} or ${name} doesn't exist`);
    });
}
export const CmdTrackPlaytime = CommandConstructor((client, message, ...content) => {
    TrackPlaytime(tracker, client, message, ...content);
    tracker.Save();
}, "Tracks your daily playtime for each game", []);
export const CmdCheckPlaytime = CommandConstructor((client, message, ...content) => CheckPlaytime(tracker, client, message, ...content), "Shows your daily playtime for each game", []);
/**
 * Checks whether or not activities contain playing
 * @param activities activities to check through
 * @returns activity if playing, null otherwise
 */
function IsPlaying(activities) {
    for (const a of activities) {
        if (a.type == "PLAYING") {
            return a;
        }
    }
    return null;
}
