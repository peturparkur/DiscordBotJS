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
export const CmdTime = CommandConstructor((client, message, ...content) => __awaiter(void 0, void 0, void 0, function* () {
    message.channel.send(new Date().toString());
}), "shows current time", []);
export class Timer {
    constructor(name = "default", jobs = []) {
        this.jobs = jobs.slice();
        this.name = name;
    }
    add_job(...job) {
        this.jobs.push(...job);
    }
    add_test() {
        console.log("timer name " + this.name);
        const callback = (_date) => { console.log("minute job callback on " + this.name); };
        this.jobs.push(schedule.scheduleJob("* * * * *", (_date) => { console.log("minute job callback on " + this.name); }));
    }
}
/*
export const timer = new Timer("new timer",[schedule.scheduleJob("* * * * *", (_date) => {
    console.log("minute job callback!")})]
    )*/ 
