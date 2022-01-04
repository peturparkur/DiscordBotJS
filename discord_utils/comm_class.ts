import * as Discord from "discord.js"

export type Command = (client : Discord.Client, message : Discord.Message, ...content : string[]) => any
export interface ICommand{
    (client : Discord.Client, message : Discord.Message, ...content : string[]) : any;
    description : string;
    params : string[];
}

export function CommandConstructor(f : Command, _description : string, _params : string[]){
    const func : ICommand = Object.assign(
        f,
        {
            description : _description,
            params : _params
        }
    )
    return func
}