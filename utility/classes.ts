import * as Discord from "discord.js";
import {Game, TicTacToe} from './games.js';

class EventHandler{
    listeners : Map<string, Function[]>

    constructor(){
        this.listeners = new Map<string, Array<Function>>()
    }

    addEventListener(type : string, callback : Function){
        if (!this.listeners.has(type)){
            this.listeners.set(type, []); //No event with this name => Add new array of functions
        }
        this.listeners.get(type)?.push(callback);
    }

    removeEventListener(type : string, callback : Function){
        if(!this.listeners.has(type)) //No event with this name
            return;
        
        let funcs = this.listeners.get(type)!;
        let i = funcs.indexOf(callback)
        funcs.splice(i, 1)
        this.listeners.set(type, funcs);
    }

    dispatchEvent(type : string, ...args){
        if(!this.listeners.has(type)) // No Event with this name
            return 1; //didn't find the call
        if(args.length > 0){
            this.listeners.get(type)?.forEach((func) => {func.call(this, args)}) //call all functions
        }
        else{
            this.listeners.get(type)?.forEach((func) => {func.call(this)}) //call all functions
        }
        return 0;
    }
}

class Room extends EventHandler {
    members : Array<Discord.GuildMember>
    game : Game

    constructor(_members : Array<Discord.GuildMember> = new Array<Discord.GuildMember>())
    {
        super();
        this.members = _members.slice(0, _members.length); //copy
    }

    AddMember(member : Discord.GuildMember){
        if(this.members.indexOf(member) < 0)
            return 1;

        this.members.push(member);
        return 0;
    }

    GetIndex(member : Discord.GuildMember){
        return this.members.indexOf(member);
    }

    HasMember(member : Discord.GuildMember){
        return this.members.indexOf(member) < 0 ? false : true;
    }
}

export { EventHandler, Room };