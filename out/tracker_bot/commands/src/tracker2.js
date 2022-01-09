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
import * as schedule from "node-schedule";
import { DeltaTime } from "../../../discord_utils/util.js";
import { config } from "dotenv"; //used only for getting API KEYS
config();
import { MongoClient } from "mongodb";
const uri = process.env.MONGODB_URI;
class PlaytimeData {
}
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
export class Tracker2 {
    constructor(mongo_uri, db = "discord_data", daily = "playtimes", weekly = 'playtimes_weekly') {
        /**
        * Is tracker started
        */
        this.started = false;
        this.connected = false;
        this.connected = false;
        this.mongoClient = new MongoClient(mongo_uri, {});
        this.db = db;
        this.collection = daily;
        this.daily = daily;
        this.weekly = weekly;
        this.clearjob = schedule.scheduleJob("tracker_reset", "0 0 * * *", (_date) => __awaiter(this, void 0, void 0, function* () {
            console.log("Daily Clear Job Called!");
            this.ClearDaily(this);
        }));
    }
    /**
     * Starts the tracker -> run on discord bot setup
     * @param client
    */
    Start(client, verbose = true) {
        if (verbose)
            console.log('Start tracker online');
        client.on('presenceUpdate', (before, after) => {
            this.ActivityChange(before, after, true, this);
        });
    }
    MoveCollections() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    ClearDaily(_tracker = this, close = true) {
        return __awaiter(this, void 0, void 0, function* () {
            yield _tracker.Connect(_tracker);
            function InsertBatch(collection, documents) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log('Insert Batch');
                    const bulkInsert = collection.initializeUnorderedBulkOp();
                    const insertedIds = [];
                    let id;
                    yield documents.forEach(doc => {
                        id = doc._id;
                        console.log(doc);
                        // Insert without raising an error for duplicates
                        bulkInsert.find({ _id: id }).upsert().replaceOne(doc);
                        insertedIds.push(id);
                    });
                    console.log('Loop Complete');
                    yield bulkInsert.execute();
                    return insertedIds;
                });
            }
            function DeleteBatch(collection, documents) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log('Delete Batch');
                    const bulkRemove = collection.initializeUnorderedBulkOp();
                    yield documents.forEach(function (doc) {
                        bulkRemove.find({ _id: doc._id }).deleteOne();
                    });
                    console.log('Loop Complete');
                    yield bulkRemove.execute();
                });
            }
            function Move_Collections(source, target, filter = {}, batch_size = 32) {
                return __awaiter(this, void 0, void 0, function* () {
                    let count = 0;
                    const ids = [];
                    console.log(`Total number of ${yield source.find(filter).count()} entries`);
                    while ((count = yield source.find(filter).count()) > 0) {
                        const sourceDocs = source.find(filter).limit(batch_size); //get documents
                        console.log('move ');
                        //console.log(await sourceDocs.toArray())
                        const ids = yield InsertBatch(target, sourceDocs);
                        const targetDocs = target.find({ _id: { $in: ids } });
                        yield DeleteBatch(source, targetDocs);
                    }
                    return 0;
                });
            }
            const playtimes = _tracker.mongoClient.db(_tracker.db).collection(_tracker.daily);
            const playtimes_weekly = _tracker.mongoClient.db(_tracker.db).collection(_tracker.weekly);
            yield Move_Collections(playtimes, playtimes_weekly, {}, 200);
            if (close)
                yield _tracker.Disconnect(_tracker);
            return;
        });
    }
    Track(user) {
    }
    Save(verbose = true) {
    }
    Load() {
    }
    Connect(_tracker = this) {
        return __awaiter(this, void 0, void 0, function* () {
            if (_tracker.connected)
                return _tracker.connected;
            yield _tracker.mongoClient.connect();
            _tracker.connected = true;
            return _tracker.connected;
        });
    }
    Disconnect(_tracker = this) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!_tracker.connected)
                return !_tracker.connected;
            yield _tracker.mongoClient.close();
            _tracker.connected = false;
            return _tracker.connected;
        });
    }
    GetPlaytime(username, close = true, _tracker = this) {
        return __awaiter(this, void 0, void 0, function* () {
            yield _tracker.Connect(_tracker);
            const collection = _tracker.mongoClient.db(_tracker.db).collection(_tracker.collection);
            const result = yield collection.find({ "user_name": username }).toArray();
            if (close)
                yield _tracker.Disconnect(_tracker);
            return result;
        });
    }
    /**
     *
     * @param query {<field> : <condition>}
     * @param close
     * @param _tracker
     * @returns
     */
    _GetEntries(query = {}, close = true, _tracker = this) {
        return __awaiter(this, void 0, void 0, function* () {
            yield _tracker.Connect(_tracker);
            const collection = _tracker.mongoClient.db(_tracker.db).collection(_tracker.daily);
            const result = yield collection.find(query).toArray();
            if (close)
                yield _tracker.Disconnect(_tracker);
            return result;
        });
    }
    /**
     *
     * @param query  {<field> : <condition>}
     * @param orderby {<field> : 1(ascending) or -1(descending)}
     * @param close
     * @param _tracker
     * @returns
    */
    _GetEntriesOrder(query = {}, orderby = {}, close = true, _tracker = this) {
        return __awaiter(this, void 0, void 0, function* () {
            yield _tracker.Connect(_tracker);
            const collection = _tracker.mongoClient.db(_tracker.db).collection(_tracker.collection);
            const result = yield collection.find(query).sort(orderby).toArray();
            //const result = await collection.find({$query : query, $orderby : orderby}).toArray()
            if (close)
                yield _tracker.Disconnect(_tracker);
            return result;
        });
    }
    GetEntries(username, game_id, close = true, _tracker = this) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield _tracker._GetEntries({ 'user_name': username, 'game_id': game_id }, close, _tracker);
        });
    }
    AddEntry(entry, close = true, _tracker = this) {
        return __awaiter(this, void 0, void 0, function* () {
            yield _tracker.Connect(_tracker);
            const collection = _tracker.mongoClient.db(_tracker.db).collection(_tracker.collection);
            yield collection.insertOne(entry);
            if (close)
                yield _tracker.Disconnect(_tracker);
            return;
        });
    }
    _UpdateEntry(query, delta, upsert = false, close = true, _tracker = this) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("_UpdateEntry => ");
            console.log(query);
            const entries = yield _tracker._GetEntries(query, false, _tracker);
            if (entries.length > 1) {
                if ((!upsert) && (entries.length <= 0)) {
                    return entries.length;
                }
                return entries.length;
            }
            console.log(entries);
            const entry = entries[0];
            const _delta = {};
            for (const [k, x] of Object.entries(delta)) {
                if (!(k in entry))
                    continue;
                if (Array.isArray(entry[k])) {
                    console.log(`${k} is an array`);
                    delta[k].push(...entry[k]);
                    delta[k] = Array.from(new Set(delta[k]));
                    console.log(delta[k]);
                    continue;
                }
                _delta[k];
                delta[k] += entry[k];
            }
            delta['last_update'] = new Date().getTime();
            const collection = _tracker.mongoClient.db(_tracker.db).collection(_tracker.collection);
            const result = yield collection.updateOne(query, [{ $set: delta }], { upsert: true });
            if (close)
                yield _tracker.Disconnect(_tracker);
            return result;
        });
    }
    UpdateEntry(username, game_id, server_id, dt, close = true, _tracker = this) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield _tracker._UpdateEntry({ 'user_name': username, 'game_id': game_id, 'server_ids': server_id }, { 'playtime': dt, 'server_ids': [server_id] }, false, close, _tracker);
        });
    }
    AddPlaytime(user, activity, guild, close = true, verbose = true, _tracker = this) {
        return __awaiter(this, void 0, void 0, function* () {
            //const results = (await _tracker._GetEntries({'user_id' : user.id, 'game_id' : activity.applicationID}, false, _tracker)) //assume it's either 1 or 0 entries
            if (user.bot)
                return;
            console.log('AddPlaytime');
            yield _tracker.Connect(_tracker);
            const entries = yield _tracker._GetEntriesOrder({ 'user_id': user.id, 'game_id': activity.applicationID }, { 'last_update': -1 }, false, _tracker);
            console.log(entries);
            let entry = null;
            let last_update = null;
            if (entries.length >= 1) {
                entry = entries[0];
                last_update = entry['last_update'];
            }
            const now = new Date().getTime();
            const today = new Date().setHours(0, 0, 0, 0);
            console.log(entry);
            // No entry for this game and user
            if (entry == null) {
                // no entry for this yet
                // no prev update time
                if (!activity.timestamps) {
                    if (close) {
                        yield _tracker.Disconnect(_tracker);
                        return;
                    }
                    return;
                }
                if (activity.timestamps.start) {
                    let dt = Math.max(now - Math.max(activity.timestamps.start.getTime(), today), 0);
                    const data = {
                        user_id: user.id,
                        game_id: activity.applicationID,
                        user_name: user.username,
                        game_name: activity.name,
                        playtime: dt,
                        server_ids: [guild.id],
                        last_update: new Date().getTime()
                    };
                    if (!guild.members.cache.get(user.id)) {
                        data.server_ids = [];
                    }
                    //const data = new DataFormat(
                    //    user.id, activity.applicationID,
                    //    user.username, activity.name, dt, guild.id).Data()
                    return yield _tracker.AddEntry(data, close, _tracker);
                }
                else {
                    if (close) {
                        yield _tracker.Disconnect(_tracker);
                        return;
                    }
                    return;
                }
            }
            let startT = null;
            try {
                startT = entry['last_update'] ? Math.max(activity.timestamps.start.getTime(), entry['last_update']) : activity.timestamps.start.getTime();
            }
            catch (error) {
                return;
            }
            if (!startT)
                return; // neither timestamp or entry exists
            console.log(`startT: prev ${entry.last_update} ~~ ${activity.timestamps.start.getTime()}`);
            // Have played previously
            let dx = now - Math.max(startT, today); // so it doesn't add more than maximum potential playtime
            let delta = { 'playtime': dx, 'server_ids': [guild.id] };
            if (!guild.members.cache.get(user.id)) {
                delta['server_ids'] = [];
            }
            yield _tracker._UpdateEntry({ 'user_id': user.id, 'game_id': activity.applicationID }, delta, false, close, _tracker);
            if (close)
                yield _tracker.Disconnect(_tracker);
            return;
        });
    }
    ActivityChange(before, after, verbose = true, _tracker = this) {
        return __awaiter(this, void 0, void 0, function* () {
            // need both information
            if (!before || !after)
                return;
            const now = new Date().getTime();
            const user = after.member.user;
            // for now track everyone
            // const tracking = await _tracker.IsTrackingUser(_tracker, user)
            const entries = yield _tracker._GetEntriesOrder({ 'user_id': user.id }, { 'last_update': -1 }, false, _tracker);
            let entry = null;
            let last_update = null;
            if (entries.length >= 1) {
                entry = entries[0];
                last_update = entry['last_update'];
            }
            if (last_update) {
                if ((now - last_update) < 1000) {
                    return; //less than a second has passed since last update
                }
            }
            const activity = IsPlaying(before.activities);
            if (IsPlaying(after.activities) && !activity) {
                const a = IsPlaying(after.activities);
                console.log(`${user.username} started playing ${a.name} @${a.createdAt}`);
            }
            if (!IsPlaying(after.activities) && activity) {
                const r = yield _tracker.AddPlaytime(user, activity, after.guild, true, verbose, _tracker);
                if (typeof r == 'number')
                    console.log(`Something went wrong in playtime[@${new Date().toDateString()}] for ${user.username} : ${activity.name} @${activity.createdAt}`);
                return r;
            }
            yield _tracker.Disconnect(_tracker);
            return;
        });
    }
    IsTrackingUser(_tracker = this, user) {
        return __awaiter(this, void 0, void 0, function* () {
            yield _tracker.Connect(_tracker);
            const res = yield _tracker.mongoClient.db(_tracker.db).collection('users').find({ 'user_id': user.id }).toArray();
            yield _tracker.Disconnect(_tracker);
            return res.length > 0;
        });
    }
    TrackUser(user, _tracker = this) {
        return __awaiter(this, void 0, void 0, function* () {
            yield _tracker.Connect(_tracker);
            const collection = _tracker.mongoClient.db(_tracker.db).collection('users');
            const arr = yield collection.find({ 'user_id': user.id }).toArray();
            if (arr.length > 0) {
                // Already tracking
                return 1; // already tracking
            }
            yield collection.insertOne({ 'user_id': user.id, 'user_name': user.username });
            yield _tracker.Disconnect(_tracker);
            return 0; //started tracking
        });
    }
    // Discord Commands
    TrackPlaytime(_tracker = this, client, message, ...content) {
        return __awaiter(this, void 0, void 0, function* () {
            yield _tracker.Connect(_tracker);
            const user = message.author;
            const r = yield _tracker.TrackUser(user, _tracker);
            yield _tracker.Disconnect(_tracker);
            if (0) {
                return message.channel.send(`Started tracking ${user.username}`);
            }
            else {
                return message.channel.send(`Already tracking ${user.username}`);
            }
        });
    }
    _UpdateUser(_tracker = this, user, guild, close = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user.bot)
                return;
            const activity = IsPlaying(user.presence.activities);
            if (activity) {
                //console.log(`${user.username} is playing ${activity.name} => add playtime`)
                yield _tracker.AddPlaytime(user, activity, guild, close, false, _tracker);
            }
            else {
                //console.log(`${user.username} is not playing`)
            }
            console.log(`Updated ${user.username}`);
        });
    }
    _CheckPlayTime(_tracker = this, user, guild) {
        return __awaiter(this, void 0, void 0, function* () {
            yield _tracker._UpdateUser(_tracker, user, guild);
            const res = yield _tracker._GetEntries({ 'user_id': user.id }, true, _tracker);
            let games = "";
            let sum = 0;
            for (const x of res) {
                sum += x.playtime;
                let dt = DeltaTime(x.playtime);
                games += `${x.game_name} => ${dt.hours} hours, ${dt.minutes} minutes, ${dt.seconds} seconds \n`;
            }
            let dt = DeltaTime(sum);
            return `Today ${user.username} played a total of ${dt.hours} hours, ${dt.minutes} minutes, ${dt.seconds} seconds \n` + games;
        });
    }
    FindUserGlobal(_tracker = this, guilds, find) {
        for (const g of guilds) {
            let m = g.members.cache.find(find);
            if (m) {
                return m.user;
            }
        }
        return undefined;
    }
    /**
     * Command for checking the playtime of the message author or the given username
     * @param _tracker
     * @param client
     * @param message
     * @param content
     * @returns
    */
    CheckPlaytime(_tracker = this, client, message, ...content) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = message.author;
            let name = user.username;
            if (content.length > 0) {
                name = content.join(' ');
                user = _tracker.FindUserGlobal(_tracker, client.guilds.cache.values(), (member) => { return member.user.username == name; });
            }
            //await _tracker.Connect(_tracker);
            console.log("Called CheckPlaytime");
            console.log("connected");
            //let member = message.guild.members.cache.find();
            //if(member){
            //    user = member.user;
            //}
            if (!user) {
                return message.channel.send(`Not tracking playtime of ${name} or ${name} doesn't exist`);
            }
            message.channel.send(yield _tracker._CheckPlayTime(_tracker, user, message.guild));
            // Global order
            yield _tracker.Connect(_tracker);
            const playtimes = _tracker.mongoClient.db(_tracker.db).collection(_tracker.daily);
            console.log('Update All Users');
            yield _tracker._UpdateAllUsers(_tracker, client.guilds.cache.values(), false);
            console.log('Collect global information');
            const guild = client.guilds.cache.values();
            const global_ranking = yield playtimes.aggregate([
                { $group: {
                        _id: '$user_id',
                        user_id: { $first: '$user_id' },
                        user_name: { $first: '$user_name' },
                        last_update: { $max: '$last_update' },
                        playtime: { $sum: '$playtime' }
                    } },
                { $sort: { 'playtime': -1 } }
            ]).toArray();
            const server_ranking = yield playtimes.aggregate([
                { $match: { 'server_ids': message.guild.id } },
                { $group: {
                        _id: '$user_id',
                        user_id: { $first: '$user_id' },
                        user_name: { $first: '$user_name' },
                        last_update: { $max: '$last_update' },
                        playtime: { $sum: '$playtime' }
                    } },
                { $sort: { 'playtime': -1 } }
            ]).toArray();
            _tracker.Disconnect(_tracker);
            console.log(server_ranking);
            const ranks = [server_ranking.findIndex(value => { return value.user_id == user.id; }), global_ranking.findIndex(value => { return value.user_id == user.id; })];
            console.log(ranks);
            if (ranks[0] >= 0) {
                message.channel.send(`Ranked ${ranks[0] + 1} / ${server_ranking.length} on ${message.guild.name}`);
            }
            if (ranks[1] >= 0) {
                message.channel.send(`Ranked ${ranks[1] + 1} / ${global_ranking.length} globally`);
            }
            return;
        });
    }
    _UpdateAllUsers(_tracker = this, guilds, close = true) {
        return __awaiter(this, void 0, void 0, function* () {
            yield _tracker.Connect(_tracker);
            const promises = [];
            for (const g of guilds) {
                g.members.cache.forEach((member) => __awaiter(this, void 0, void 0, function* () {
                    promises.push(_tracker._UpdateUser(_tracker, member.user, member.guild, false));
                }));
            }
            yield Promise.all(promises);
            if (close)
                yield _tracker.Disconnect(_tracker);
        });
    }
    /**
     * Shows the person who played the most today
     * @param _tracker
     * @param client
     * @param message
     * @param content
    */
    CheckMostPlayed(_tracker = this, client, message, ...content) {
        return __awaiter(this, void 0, void 0, function* () {
            let count = 5;
            if (content.length > 0) {
                try {
                    count = parseInt(content.join(' '));
                }
                catch (err) {
                    console.log('content cannot be converted to number ' + err);
                }
            }
            yield _tracker.Connect(_tracker);
            console.log('Running top on ' + message.guild.name);
            for (const x of message.guild.members.cache.values()) {
                yield _tracker._UpdateUser(_tracker, x.user, message.guild, false);
            }
            /*(member => {
                console.log(member.displayName)
                _tracker._UpdateUser(_tracker, member.user, message.guild, false)
            })*/
            console.log('Completed Update');
            const playtimes = _tracker.mongoClient.db('discord_data').collection('playtimes');
            const res = yield playtimes.aggregate([
                // group construction
                { $match: { 'server_ids': message.guild.id } },
                { $group: {
                        _id: '$user_id',
                        user_id: { $first: '$user_id' },
                        user_name: { $first: '$user_name' },
                        last_update: { $max: '$last_update' },
                        playtime: { $sum: '$playtime' }
                    } },
                { $sort: { 'playtime': -1 } },
                { $limit: count } //return 10 of the resulted groups
            ]).toArray();
            _tracker.Disconnect(_tracker);
            console.log('tops???');
            console.log(res);
            message.channel.send(`Daily Top ${res.length} Players on ${message.guild.name}!`);
            let promises = [];
            for (const [i, x] of res.entries()) {
                let dt = DeltaTime(x.playtime);
                let line = '';
                line += `${i + 1}.`;
                if (i == 0)
                    line += " 👑🥇";
                if (i == 1)
                    line += " 🥈";
                if (i == 2)
                    line += " 🥉";
                line += ` ${message.guild.members.cache.find(member => { return member.user.username == x.user_name; }).displayName}`;
                line += ` => ${dt.hours} hours, ${dt.minutes} minutes, ${dt.seconds} seconds `;
                if (i == 0)
                    line += " 👑🥇";
                if (i == 1)
                    line += " 🥈";
                if (i == 2)
                    line += " 🥉";
                promises.push(message.channel.send(line));
            }
            yield Promise.all(promises);
            return;
        });
    }
    /**
     * Shows the person who played the most today
     * @param _tracker
     * @param client
     * @param message
     * @param content
    */
    CheckGlobalMostPlayed(_tracker = this, client, message, ...content) {
        return __awaiter(this, void 0, void 0, function* () {
            let count = 5;
            if (content.length > 0) {
                try {
                    count = parseInt(content.join(' '));
                }
                catch (err) {
                    console.log('content cannot be converted to number ' + err);
                }
            }
            yield _tracker.Connect(_tracker);
            console.log('Running top on ' + message.guild.name);
            yield _tracker._UpdateAllUsers(_tracker, client.guilds.cache.values(), false); // update all users on all servers
            /*for(const x of message.guild.members.cache.values()){
                await _tracker._UpdateUser(_tracker, x.user, message.guild, false)
            }*/
            /*(member => {
                console.log(member.displayName)
                _tracker._UpdateUser(_tracker, member.user, message.guild, false)
            })*/
            console.log('Completed Update');
            const playtimes = _tracker.mongoClient.db('discord_data').collection('playtimes');
            const res = yield playtimes.aggregate([
                // group construction
                { $group: {
                        _id: '$user_id',
                        user_id: { $first: '$user_id' },
                        user_name: { $first: '$user_name' },
                        last_update: { $max: '$last_update' },
                        playtime: { $sum: '$playtime' }
                    } },
                { $sort: { 'playtime': -1 } },
                { $limit: count } //return 10 of the resulted groups
            ]).toArray();
            _tracker.Disconnect(_tracker);
            console.log('tops???');
            console.log(res);
            message.channel.send(`Daily Top ${res.length} Players Globally!`);
            let promises = [];
            for (const [i, x] of res.entries()) {
                let dt = DeltaTime(x.playtime);
                let line = '';
                line += `${i + 1}.`;
                if (i == 0)
                    line += " 👑🥇";
                if (i == 1)
                    line += " 🥈";
                if (i == 2)
                    line += " 🥉";
                line += ` ${x.user_name}`;
                line += ` => ${dt.hours} hours, ${dt.minutes} minutes, ${dt.seconds} seconds `;
                if (i == 0)
                    line += " 👑🥇";
                if (i == 1)
                    line += " 🥈";
                if (i == 2)
                    line += " 🥉";
                promises.push(message.channel.send(line));
            }
            yield Promise.all(promises);
            return;
        });
    }
}
export const tracker2 = new Tracker2(process.env.MONGODB_URI);
// Commands
export const CmdCheckTopPlaytime = CommandConstructor((client, message, ...content) => {
    tracker2.CheckMostPlayed(tracker2, client, message, ...content);
}, "Shows Daily Top played players", []);
export const CmdCheckGlobalTopPlaytime = CommandConstructor((client, message, ...content) => {
    tracker2.CheckGlobalMostPlayed(tracker2, client, message, ...content);
}, "Shows Daily Globally Top played players", []);
export const CmdTrackPlaytime2 = CommandConstructor((client, message, ...content) => {
    tracker2.TrackPlaytime(tracker2, client, message, ...content);
}, "Tracks your daily playtime for each game", []);
export const CmdCheckPlaytime2 = CommandConstructor((client, message, ...content) => tracker2.CheckPlaytime(tracker2, client, message, ...content), "Shows your daily playtime for each game", []);
export const CmdClear = CommandConstructor((client, message, ...content) => tracker2.ClearDaily(tracker2), "Clears daily data TESTING", []);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield tracker2.Connect(tracker2);
        const collection = tracker2.mongoClient.db('discord_data').collection('playtimes');
        //await tracker2.AddEntry(new DataFormat('asda', 'gm1', 'peter', 'something', 111, ''), true, tracker2)
        //await collection.insertOne(new DataFormat('asda', 'gm2', 'peter', 'somesome', 10))
        /*
        const res = await collection.aggregate([
            // group construction
            {$group : {
                        _id : '$user_id',
                        user_id : {$first : '$user_id'},
                        user_name : {$first : '$user_name'},
                        last_update : {$max : '$last_update'},
                        playtime : {$sum : '$playtime'}
                    }},
            {$sort : {'playtime' : -1}}, // order groups in descending order
            {$limit : 10} //return 10 of the resulted groups
        ]).toArray()
        console.log(res)
        */
        yield tracker2.Disconnect();
    });
}
//main()
