import * as Discord from "discord.js";
import { CommandConstructor, ICommand } from "../../../discord_utils/comm_class.js"
import fs from "fs" //file system
import * as schedule from "node-schedule"
import { DeltaTime, FileExists, LoadObjectJson, Map2Obj, Obj2Map, SaveObjectJson } from "../../../discord_utils/util.js";
import {config} from "dotenv"; //used only for getting API KEYS
config()

import { MongoClient, Collection, FindCursor, WithId } from "mongodb";
import { tracker } from "./tracker.js";
const uri = process.env.MONGODB_URI;

interface IPlaytimeData{
    user_id: string;
    game_id: string;
    user_name: string;
    game_name: string;
    playtime: number;
    server_ids: string[];
    last_update: number;
}

class PlaytimeData implements IPlaytimeData{
    user_id: string;
    game_id: string;
    user_name: string;
    game_name: string;
    playtime: number;
    server_ids: string[];
    last_update: number;
}

/**
 * Checks whether or not activities contain playing
 * @param activities activities to check through
 * @returns activity if playing, null otherwise
 */
 function IsPlaying(activities:Array<Discord.Activity>) : Discord.Activity | null{
    for (const a of activities){
        if (a.type == "PLAYING"){
            return a
        }
    }
    return null
}

export class Tracker2{
    /**
    * Is tracker started
    */
    started : boolean = false;

    clearjob : schedule.Job;

    connected : boolean = false;
    mongoClient : MongoClient;
    db : string;
    collection : string;

    daily : string;
    weekly : string;

    constructor(mongo_uri : string, db : string = "discord_data", daily : string = "playtimes", weekly : string = 'playtimes_weekly'){
        this.connected = false;
        this.mongoClient = new MongoClient(mongo_uri, {});
        this.db = db;
        this.collection = daily;
        this.daily = daily;
        this.weekly = weekly;

        this.clearjob = schedule.scheduleJob("tracker_reset", "0 0 * * *", async (_date) => {
            console.log("Daily Clear Job Called!")
            this.ClearDaily(this)
        })
    }

    /**
     * Starts the tracker -> run on discord bot setup
     * @param client 
    */
     Start(client : Discord.Client, verbose : boolean = true){
        if(verbose) console.log('Start tracker online')

        client.on('presenceUpdate', (before, after) =>{
            this.ActivityChange(before, after, true, this)
        })
    }

    async MoveCollections(){

    }

    async ClearDaily(_tracker : Tracker2 = this, close : boolean = true)
    {
        await _tracker.Connect(_tracker);

        async function InsertBatch(collection : Collection<Document>, documents : FindCursor<WithId<Document>>) {
            console.log('Insert Batch')
            const bulkInsert = collection.initializeUnorderedBulkOp();
            const insertedIds = [];
            let id;
            await documents.forEach(doc => {
              id = doc._id;
              console.log(doc)
              // Insert without raising an error for duplicates
              bulkInsert.find({_id: id}).upsert().replaceOne(doc);
              insertedIds.push(id);
            });
            console.log('Loop Complete')
            await bulkInsert.execute();
            return insertedIds;
        }

        async function DeleteBatch(collection: Collection<Document>, documents: FindCursor<WithId<Document>>) {
            console.log('Delete Batch')
            const bulkRemove = collection.initializeUnorderedBulkOp();
            await documents.forEach(function(doc) {
                bulkRemove.find({_id: doc._id}).deleteOne()
            });
            console.log('Loop Complete')
            await bulkRemove.execute();
        }

        async function Move_Collections(source: Collection<Document>, target: Collection<Document>, filter : any = {}, batch_size : number = 32){
            let count = 0
            const ids = []
            console.log(`Total number of ${await source.find(filter).count()} entries`)
            while((count = await source.find(filter).count()) > 0){
                const sourceDocs = source.find(filter).limit(batch_size) //get documents
                console.log('move ')
                //console.log(await sourceDocs.toArray())
                const ids = await InsertBatch(target, sourceDocs)

                const targetDocs = target.find({_id: {$in: ids}});
                await DeleteBatch(source, targetDocs)
            }
            return 0
        }
        const playtimes : Collection<Document> = _tracker.mongoClient.db(_tracker.db).collection(_tracker.daily)
        const playtimes_weekly : Collection<Document> = _tracker.mongoClient.db(_tracker.db).collection(_tracker.weekly)

        await Move_Collections(playtimes, playtimes_weekly, {}, 200)
        if(close)
            await _tracker.Disconnect(_tracker)
        return
    }

    Track(user : Discord.User){

    }

    Save(verbose : boolean = true){

    }

    Load(){

    }

    async Connect(_tracker : Tracker2 = this){
        if(_tracker.connected) return _tracker.connected;
        await _tracker.mongoClient.connect();
        _tracker.connected = true;
        return _tracker.connected;
    }

    async Disconnect(_tracker : Tracker2 = this){
        if(!_tracker.connected) return !_tracker.connected;
        await _tracker.mongoClient.close();
        _tracker.connected = false;
        return _tracker.connected;
    }

    async GetPlaytime(username : string, close : boolean = true, _tracker : Tracker2 = this){
        await _tracker.Connect(_tracker)
        const collection = _tracker.mongoClient.db(_tracker.db).collection(_tracker.collection)
        const result = await collection.find({"user_name" : username}).toArray()
        if(close)
            await _tracker.Disconnect(_tracker)
        return result;
    }
    /**
     * 
     * @param query {<field> : <condition>}
     * @param close 
     * @param _tracker 
     * @returns 
     */
    async _GetEntries(query : Object = {}, close : boolean = true, _tracker : Tracker2 = this){
        await _tracker.Connect(_tracker)
        const collection : Collection<IPlaytimeData> = _tracker.mongoClient.db(_tracker.db).collection(_tracker.daily)
        const result = await collection.find(query).toArray()
        if(close)
            await _tracker.Disconnect(_tracker)
        return result;
    }

    /**
     * 
     * @param query  {<field> : <condition>}
     * @param orderby {<field> : 1(ascending) or -1(descending)}
     * @param close 
     * @param _tracker 
     * @returns 
    */
    async _GetEntriesOrder(query : Object = {}, orderby : any = {}, close : boolean = true, _tracker : Tracker2 = this){
        await _tracker.Connect(_tracker)
        const collection : Collection<IPlaytimeData> = _tracker.mongoClient.db(_tracker.db).collection(_tracker.collection)
        const result = await collection.find(query).sort(orderby).toArray()
        //const result = await collection.find({$query : query, $orderby : orderby}).toArray()
        if(close)
            await _tracker.Disconnect(_tracker)
        return result;
    }

    async GetEntries(username : string, game_id : string, close : boolean = true, _tracker : Tracker2 = this){
        return await _tracker._GetEntries({'user_name' : username, 'game_id' : game_id}, close, _tracker)
    }

    async AddEntry(entry : IPlaytimeData, close : boolean = true, _tracker : Tracker2 = this){
        await _tracker.Connect(_tracker);
        const collection: Collection<IPlaytimeData> = _tracker.mongoClient.db(_tracker.db).collection(_tracker.collection)
        await collection.insertOne(entry)
        if(close)
            await _tracker.Disconnect(_tracker)
        return
    }

    async _UpdateEntry(query : Object, delta : Object, upsert : boolean = false, close : boolean = true, _tracker : Tracker2 = this){
        console.log("_UpdateEntry => ")
        console.log(query)
        const entries = await _tracker._GetEntries(query, false, _tracker);
        if (entries.length > 1){
            if((!upsert) && (entries.length <= 0)){
                return entries.length
            }
            return entries.length
        }
        console.log(entries)
        const entry = entries[0]
        const _delta = {}
        for(const [k, x] of Object.entries(delta)){
            if(!(k in entry)) continue;
            if(Array.isArray(entry[k])){
                console.log(`${k} is an array`)
                delta[k].push(...entry[k])
                delta[k] = Array.from(new Set(delta[k]))
                console.log(delta[k])
                continue
            }
            _delta[k]
            delta[k] += entry[k]
        }
        delta['last_update'] = new Date().getTime()

        const collection: Collection<IPlaytimeData> = _tracker.mongoClient.db(_tracker.db).collection(_tracker.collection)
        const result = await collection.updateOne(
            query, [{$set: delta}], {upsert : true})
        if(close)
            await _tracker.Disconnect(_tracker)
        return result;
    }

    async UpdateEntry(username : string, game_id : string, server_id : string, dt : number, close : boolean = true, _tracker : Tracker2 = this){
        return await _tracker._UpdateEntry({'user_name' : username, 'game_id' : game_id, 'server_ids' : server_id}, 
                                {'playtime' : dt, 'server_ids' : [server_id]}, false, close, _tracker)
    }

    async AddPlaytime(user : Discord.User, activity : Discord.Activity, guild : Discord.Guild, close : boolean = true, verbose : boolean = true, _tracker = this){
        //const results = (await _tracker._GetEntries({'user_id' : user.id, 'game_id' : activity.applicationID}, false, _tracker)) //assume it's either 1 or 0 entries
        if (user.bot) return;

        console.log('AddPlaytime')
        await _tracker.Connect(_tracker)
        const entries = await _tracker._GetEntriesOrder({'user_id' : user.id, 'game_id' : activity.applicationID}, {'last_update' : -1}, false, _tracker)
        console.log(entries)

        let entry : IPlaytimeData | null = null
        let last_update = null
        if (entries.length >= 1){
            entry = entries[0]
            last_update = entry['last_update']
        }

        const now = new Date().getTime()
        const today = new Date().setHours(0, 0, 0, 0)
        console.log(entry)

        // No entry for this game and user
        if(entry == null){
            // no entry for this yet
            // no prev update time
            if(!activity.timestamps){
                if(close){
                    await _tracker.Disconnect(_tracker)
                    return
                }
                return
            }
            if(activity.timestamps.start){
                let dt = Math.max(now - Math.max(activity.timestamps.start.getTime(), today), 0)
                const data : IPlaytimeData = {
                    user_id: user.id,
                    game_id: activity.applicationID,
                    user_name: user.username,
                    game_name: activity.name,
                    playtime: dt,
                    server_ids: [guild.id],
                    last_update: new Date().getTime()
                }
                if(!guild.members.cache.get(user.id)){
                    data.server_ids = []
                }
                
                //const data = new DataFormat(
                //    user.id, activity.applicationID,
                //    user.username, activity.name, dt, guild.id).Data()
                return await _tracker.AddEntry(data, close, _tracker)
            }
            else{
                if(close){
                    await _tracker.Disconnect(_tracker)
                    return
                }
                return
            }
        }
        let startT : number = null
        try {
            startT = entry['last_update'] ? Math.max(activity.timestamps.start.getTime(), entry['last_update']) : activity.timestamps.start.getTime();
        } catch (error) {
            return
        }
        

        if(!startT) return; // neither timestamp or entry exists
        console.log(`startT: prev ${entry.last_update} ~~ ${activity.timestamps.start.getTime()}`)

        // Have played previously
        let dx = now - Math.max(startT, today) // so it doesn't add more than maximum potential playtime
        let delta = {'playtime' : dx, 'server_ids' : [guild.id]}
        if(!guild.members.cache.get(user.id)){
            delta['server_ids'] = []
        }
        await _tracker._UpdateEntry({'user_id' : user.id, 'game_id' : activity.applicationID}, delta, false, close, _tracker)
        if (close)
            await _tracker.Disconnect(_tracker)
        return
    }

    async ActivityChange(before : Discord.Presence, after : Discord.Presence, verbose : boolean = true, _tracker : Tracker2 = this){
        if(!_tracker.started) return

        // need both information
        if(!before || !after)
            return

        const now = new Date().getTime()
        const user = after.member.user

        // for now track everyone
        // const tracking = await _tracker.IsTrackingUser(_tracker, user)

        const entries = await _tracker._GetEntriesOrder({'user_id' : user.id}, {'last_update' : -1}, false, _tracker)
        let entry : IPlaytimeData | null = null
        let last_update = null
        if (entries.length >= 1){
            entry = entries[0]
            last_update = entry['last_update']
        }


        if(last_update){
            if((now - last_update) < 1000){
                return //less than a second has passed since last update
            }
        }
        const activity = IsPlaying(before.activities)
        if(IsPlaying(after.activities) && !activity){
            const a = IsPlaying(after.activities)
            console.log(`${user.username} started playing ${a.name} @${a.createdAt}`)
        }

        if(!IsPlaying(after.activities) && activity){
            const r = await _tracker.AddPlaytime(user, activity, after.guild, true, verbose, _tracker)
            if(typeof r == 'number')
                console.log(`Something went wrong in playtime[@${new Date().toDateString()}] for ${user.username} : ${activity.name} @${activity.createdAt}`)

            return r
        }
        await _tracker.Disconnect(_tracker)
        return
    }

    async IsTrackingUser(_tracker : Tracker2 = this, user : Discord.User){
        await _tracker.Connect(_tracker)
        const res = await _tracker.mongoClient.db(_tracker.db).collection('users').find({'user_id' : user.id}).toArray()
        await _tracker.Disconnect(_tracker)
        return res.length > 0;
    }

    async TrackUser(user : Discord.User, _tracker : Tracker2 = this){
        await _tracker.Connect(_tracker)
        const collection = _tracker.mongoClient.db(_tracker.db).collection('users');
        const arr = await collection.find({'user_id' : user.id}).toArray()
        if(arr.length > 0){
            // Already tracking
            return 1 // already tracking
        }
        await collection.insertOne({'user_id' : user.id, 'user_name' : user.username})
        await _tracker.Disconnect(_tracker);
        return 0 //started tracking
    }

    // Discord Commands
    async TrackPlaytime(_tracker : Tracker2 = this, client : Discord.Client, message : Discord.Message, ...content : string[]){
        await _tracker.Connect(_tracker);
        const user = message.author;
        const r = await _tracker.TrackUser(user, _tracker)
        await _tracker.Disconnect(_tracker);
        if(0){
            return message.channel.send(`Started tracking ${user.username}`)
        }
        else{
            return message.channel.send(`Already tracking ${user.username}`)
        }
    }


    async _UpdateUser(_tracker : Tracker2 = this, user : Discord.User, guild : Discord.Guild, close : boolean = true){
        if(user.bot) return;
        const activity = IsPlaying(user.presence.activities)
        if(activity){
            //console.log(`${user.username} is playing ${activity.name} => add playtime`)
            await _tracker.AddPlaytime(user, activity, guild, close, false, _tracker)
        }
        else{
            //console.log(`${user.username} is not playing`)
        }
        console.log(`Updated ${user.username}`)
    }

    async _CheckPlayTime(_tracker : Tracker2 = this, user : Discord.User, guild : Discord.Guild){
        await _tracker._UpdateUser(_tracker, user, guild)
        const res = await _tracker._GetEntries({'user_id' : user.id}, true, _tracker)

        let games : string = ""
        let sum : number = 0
        for(const x of res){
            sum += x.playtime
            let dt = DeltaTime(x.playtime)
            games += `${x.game_name} => ${dt.hours} hours, ${dt.minutes} minutes, ${dt.seconds} seconds \n`
        }
        let dt = DeltaTime(sum)
        return `Today ${user.username} played a total of ${dt.hours} hours, ${dt.minutes} minutes, ${dt.seconds} seconds \n` + games
    }

    FindUserGlobal(_tracker : Tracker2 = this, guilds : IterableIterator<Discord.Guild>, find : ((member : Discord.GuildMember) => boolean)){
        for(const g of guilds){
            let m = g.members.cache.find(find)
            if(m){
                return m.user;
            }
        }
        return undefined
    }

    /**
     * Command for checking the playtime of the message author or the given username
     * @param _tracker 
     * @param client 
     * @param message 
     * @param content 
     * @returns 
    */
    async CheckPlaytime(_tracker : Tracker2 = this, client : Discord.Client, message : Discord.Message, ...content : string[]){
        let user = message.author;
        let name = user.username;
        if (content.length > 0){
            name = content.join(' ');
            user = _tracker.FindUserGlobal(_tracker, client.guilds.cache.values(), (member : Discord.GuildMember) => {return member.user.username == name})
        }
        //await _tracker.Connect(_tracker);
        console.log("Called CheckPlaytime")
        console.log("connected")
        //let member = message.guild.members.cache.find();
        //if(member){
        //    user = member.user;
        //}
        if(!user){
            return message.channel.send(`Not tracking playtime of ${name} or ${name} doesn't exist`)
        }
        message.channel.send(await _tracker._CheckPlayTime(_tracker, user, message.guild))


        // Global order
        await _tracker.Connect(_tracker)
        const playtimes : Collection<IPlaytimeData> = _tracker.mongoClient.db(_tracker.db).collection(_tracker.daily)

        console.log('Update All Users')
        await _tracker._UpdateAllUsers(_tracker, client.guilds.cache.values(), false)

        console.log('Collect global information')
        const guild = client.guilds.cache.values()
        const global_ranking = await playtimes.aggregate<IPlaytimeData>(
            [
                {$group : {
                        _id : '$user_id',
                        user_id : {$first : '$user_id'},
                        user_name : {$first : '$user_name'},
                        last_update : {$max : '$last_update'},
                        playtime : {$sum : '$playtime'}
                }},
                {$sort: {'playtime': -1}}
            ]
        ).toArray()
        const server_ranking = await playtimes.aggregate<IPlaytimeData>(
            [
                {$match : {'server_ids' : message.guild.id}},
                {$group : {
                        _id : '$user_id',
                        user_id : {$first : '$user_id'},
                        user_name : {$first : '$user_name'},
                        last_update : {$max : '$last_update'},
                        playtime : {$sum : '$playtime'}
                }},
                {$sort: {'playtime': -1}}
            ]
        ).toArray()
        _tracker.Disconnect(_tracker)

        console.log(server_ranking)

        const ranks = [server_ranking.findIndex(value => {return value.user_id == user.id}), global_ranking.findIndex(value => {return value.user_id == user.id})]
        console.log(ranks)
        if(ranks[0] >= 0){
            message.channel.send(`Ranked ${ranks[0] + 1} on ${message.guild.name}`)
        }
        if(ranks[1] >= 0){
            message.channel.send(`Ranked ${ranks[1] + 1} globally`)
        }

        return
    }

    async _UpdateAllUsers(_tracker : Tracker2 = this, guilds : IterableIterator<Discord.Guild>, close : boolean = true){
        await _tracker.Connect(_tracker)
        const promises : Promise<any>[] = []
        for(const g of guilds){
            g.members.cache.forEach(async member => {
                promises.push(_tracker._UpdateUser(_tracker, member.user, member.guild, false))
            })
        }
        await Promise.all(promises)
        if (close)
            await _tracker.Disconnect(_tracker)
    }


    /**
     * Shows the person who played the most today
     * @param _tracker 
     * @param client 
     * @param message 
     * @param content 
    */
    async CheckMostPlayed(_tracker : Tracker2 = this, client : Discord.Client, message : Discord.Message, ...content : string[]){
        await _tracker.Connect(_tracker)
        console.log('Running top on ' + message.guild.name)
        for(const x of message.guild.members.cache.values()){
            await _tracker._UpdateUser(_tracker, x.user, message.guild, false)
        }
        
        /*(member => {
            console.log(member.displayName)
            _tracker._UpdateUser(_tracker, member.user, message.guild, false)
        })*/
        console.log('Completed Update')
        const playtimes = _tracker.mongoClient.db('discord_data').collection('playtimes')
        const res = (await playtimes.aggregate([
            // group construction
            {$match : {'server_ids' : message.guild.id}},
            {$group : {
                        _id : '$user_id',
                        user_id : {$first : '$user_id'},
                        user_name : {$first : '$user_name'},
                        last_update : {$max : '$last_update'},
                        playtime : {$sum : '$playtime'}
                    }},
            {$sort : {'playtime' : -1}}, // order groups in descending order
            {$limit : 5} //return 10 of the resulted groups
        ]).toArray() as IPlaytimeData[])
        _tracker.Disconnect(_tracker)

        console.log('tops???')
        console.log(res) 

        message.channel.send(`Daily Top Players on ${message.guild.name}!`)
        let promises : Promise<any>[] = []
        for(const [i, x] of res.entries()){
            let dt = DeltaTime(x.playtime)
            let line = '';
            line += `${i + 1}.`;
            if(i == 0)
                line += " 👑"
            line += ` ${message.guild.members.cache.find(member => {return member.user.username == x.user_name}).displayName}`
            line += ` => ${dt.hours} hours, ${dt.minutes} minutes, ${dt.seconds} seconds `
            if(i == 0)
                line += " 👑"
            promises.push(message.channel.send(line))
        }
        await Promise.all(promises)
        return
    }

    /**
     * Shows the person who played the most today
     * @param _tracker 
     * @param client 
     * @param message 
     * @param content 
    */
     async CheckGlobalMostPlayed(_tracker : Tracker2 = this, client : Discord.Client, message : Discord.Message, ...content : string[]){
        await _tracker.Connect(_tracker)
        console.log('Running top on ' + message.guild.name)
        await _tracker._UpdateAllUsers(_tracker, client.guilds.cache.values(), false) // update all users on all servers
        /*for(const x of message.guild.members.cache.values()){
            await _tracker._UpdateUser(_tracker, x.user, message.guild, false)
        }*/
        
        /*(member => {
            console.log(member.displayName)
            _tracker._UpdateUser(_tracker, member.user, message.guild, false)
        })*/
        console.log('Completed Update')
        const playtimes = _tracker.mongoClient.db('discord_data').collection('playtimes')
        const res = (await playtimes.aggregate([
            // group construction
            {$group : {
                        _id : '$user_id',
                        user_id : {$first : '$user_id'},
                        user_name : {$first : '$user_name'},
                        last_update : {$max : '$last_update'},
                        playtime : {$sum : '$playtime'}
                    }},
            {$sort : {'playtime' : -1}}, // order groups in descending order
            {$limit : 5} //return 10 of the resulted groups
        ]).toArray() as IPlaytimeData[])
        _tracker.Disconnect(_tracker)
        console.log('tops???')
        console.log(res) 

        message.channel.send(`Daily Top Players Globally!`)
        let promises : Promise<any>[] = []
        for(const [i, x] of res.entries()){
            let dt = DeltaTime(x.playtime)
            let line = '';
            line += `${i + 1}.`;
            if(i == 0)
                line += " 👑"
            line += ` ${x.user_name}`
            line += ` => ${dt.hours} hours, ${dt.minutes} minutes, ${dt.seconds} seconds `
            if(i == 0)
                line += " 👑"
            promises.push(message.channel.send(line))
        }
        await Promise.all(promises)
        return
    }
}

export const tracker2 = new Tracker2(process.env.MONGODB_URI)

// Commands
export const CmdCheckTopPlaytime = CommandConstructor(
    (client : Discord.Client, message : Discord.Message, ...content : string[]) => 
    {
        tracker2.CheckMostPlayed(tracker2, client, message, ...content)
    }, 
    "Shows Daily Top played players", []
)

export const CmdCheckGlobalTopPlaytime = CommandConstructor(
    (client : Discord.Client, message : Discord.Message, ...content : string[]) => 
    {
        tracker2.CheckGlobalMostPlayed(tracker2, client, message, ...content)
    }, 
    "Shows Daily Globally Top played players", []
)

export const CmdTrackPlaytime2 = CommandConstructor(
    (client : Discord.Client, message : Discord.Message, ...content : string[]) => 
    {
        tracker2.TrackPlaytime(tracker2, client, message, ...content)
    }, 
    "Tracks your daily playtime for each game", []
)

export const CmdCheckPlaytime2 = CommandConstructor(
    (client : Discord.Client, message : Discord.Message, ...content : string[]) => tracker2.CheckPlaytime(tracker2, client, message, ...content), "Shows your daily playtime for each game", [])

export const CmdClear = CommandConstructor(
    (client : Discord.Client, message : Discord.Message, ...content : string[]) => tracker2.ClearDaily(tracker2), "Clears daily data TESTING", [])
    

async function main(){
    await tracker2.Connect(tracker2)
    const collection = tracker2.mongoClient.db('discord_data').collection('playtimes')
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
    await tracker2.Disconnect()
}
//main()