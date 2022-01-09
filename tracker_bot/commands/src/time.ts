import * as Discord from "discord.js";
import { CommandConstructor, ICommand } from "../../../discord_utils/comm_class.js"
import * as schedule from "node-schedule"

export const CmdTime = CommandConstructor(async (client : Discord.Client, message : Discord.Message, ...content : string[]) => {
    message.channel.send(new Date().toString())
}, "shows current time", [])

export class Timer{
    jobs : schedule.Job[]
    name : string

    constructor(name : string = "default", jobs : schedule.Job[] = []){
        this.jobs = jobs.slice()
        this.name = name
    }

    add_job(...job : schedule.Job[]){
        this.jobs.push(...job)
    }


    add_test(){
        console.log("timer name " + this.name)
        const callback = (_date : Date) => {console.log("minute job callback on " + this.name)}
        this.jobs.push(schedule.scheduleJob("* * * * *", (_date : Date) => {console.log("minute job callback on " + this.name)}))
    }
}
/*
export const timer = new Timer("new timer",[schedule.scheduleJob("* * * * *", (_date) => {
    console.log("minute job callback!")})]
    )*/