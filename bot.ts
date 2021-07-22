import * as Discord from "discord.js"
import {config} from "dotenv"
console.log("Hello");

config()
let TOKEN = process.env.TOKEN
console.log(TOKEN)

function Clamp(x : number, a : number = 0, b : number = 1){
    return Math.max(Math.min(x, b), a)
}

let time_to_listen = 60;

const client = new Discord.Client();
let GREETINGS = ["hi", "hello", "hey", "helloo", "yo", "hellooo", "g morning", "gmorning", "good morning",
                "morning", "good day", "good afternoon", "good evening", /*"greetings"*/, "greeting", 
                "good to see you", "its good seeing you", "how are you", "how're you", "how are you doing",
                "how ya doin'", "how ya doin", "how is everything", "how is everything going",
                "how's everything going", "how is you", "how's you", "how are things", "how're things", 
                "how is it going", "how's it going", "how's it goin'", "how's it goin", "how is life been treating you", 
                "how's life been treating you", "how have you been", "how've you been", "what is up", 
                "what's up", "what is cracking", "what's cracking", "what is good", "what's good", 
                "what is happening", "what's happening", "what is new", "what's new", "what is neww", 
                "g’day", "howdy", "top of the morning to you", "top of the morning to ya"]

let SELF = [
            "bot", "pybot", "ai", "robot", "automation", "computer", "machine", "droid"
]

let LISTENING = new Map<Discord.GuildMember, number>(); // who we listen to for commands

const COMMANDS = new Map<string, Function>();
COMMANDS.set("dice roll", () => {return Math.floor(Math.random() * 7)});


// ALL EVENTS: https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584

client.on("ready", async () => {
    console.log(`Logged in as ${client.user?.tag}`);

    client.guilds.cache.each(g => {console.log(`Joined Guild: ${g.name}`)})
});

//called when a message has been sent
client.on("message", async (message) => {
    //check the author
    let author = message.author;
    if (author.bot) return;
    /*
    if(message.content.endsWith("bot"))
    {
        await message.channel.send(`You called me ${message.member.displayName}?`)
    }*/

    if (LISTENING.has(message.member)){
        //this person already greeted us => can call functions
        COMMANDS.forEach((func, key) =>{
            if(message.content == key){
                message.channel.send(`<@${message.author.id}> : ${func()}`)
                LISTENING.set(message.member, time_to_listen);
                return;
            }
        })
    }

    let norm_content = message.content.toLowerCase()
    for(let x in GREETINGS){
        let i = parseInt(x)
        for(let y of SELF){
            if(norm_content.includes(`${GREETINGS[i]} ${y}`)){
                console.log("We heard a greeting");
                let r = Clamp(i + Math.floor(Math.random() * 3), 0, GREETINGS.length-1)
                //let elem = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
                let elem = GREETINGS[r]
                await message.channel.send(`${elem} ${message.member.displayName}`);
                console.log(`Start listening to ${message.member.displayName}`);
                LISTENING.set(message.member, time_to_listen); //we will listen to this person for 60 seconds
                break;
            }
        }
    }
    
    console.log(`${author.username} aka. ${message.member.displayName} sent msg ${message.content} in channel ${message.channel.id}`)
});

//called when the user types typing
client.on("typingStart", async (chn, user) => {
    console.log(`User ${user.username} is typing in channel ${chn.id}`);
});

//Called when someone joins or leaves a voice channel
//member is the user
client.on("voiceStateUpdate", async (before, after) =>{
    console.log(`${(before.member != null) ? before.member.displayName : "Null"} => ${(after.member != null) ? after.member.displayName : "Null"}`)
    console.log(`${(before.channel != null) ? before.channel.name : "Null"} => ${(after.channel != null) ? after.channel.name : "Null"}`)
});

//Called when the member starts/stops speaking
client.on("guildMemberSpeaking", async (member, speaking) =>{
    console.log(`The server member ${member.displayName} is speaking ${speaking}`);
});


//Called when the member changes themselves eg.: role, nickname, etc
client.on("guildMemberUpdate", async (before, after) => {
    console.log(`Member ${before.displayName} : ${before.displayName} changed their profile`);
    console.log(`Member ${after.displayName} : ${after.displayName} changed their profile`);
});

//Called when a user's details are changed
client.on("userUpdate", function(oldUser, newUser){
    console.log(`user's details (e.g. username) are changed`);
});

const countdown = setInterval(() => {
    LISTENING.forEach((x, key) => {
        LISTENING.set(key, x-1)
        if(x <= 0){
            console.log(`Stop listening to ${key.displayName}`);
            LISTENING.delete(key);
        }
    });

}, 1 * 1000) //1000 milliseconds
client.login(TOKEN)