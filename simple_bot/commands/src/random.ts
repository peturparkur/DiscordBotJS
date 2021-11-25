import * as Discord from "discord.js"
import { Gaussian, RandInt } from "../../../utility/putil_maths.js"
import { CommandConstructor, ICommand } from "../../utility/comm_class.js"

function get_min_max(...content : string[]){
    let _min = 0
    let _max = 1
    if (content.length > 0){
        if (content.length == 1){
            try{
                _max = parseInt(content[0])
            }
            catch (err){
                console.log(`Error ${err}`)
            }
        }
        if(content.length == 2){
            try{
                _min = parseInt(content[0])
                _max = parseInt(content[1])
            }
            catch (err){
                console.log(`Error ${err}`)
            }
        }
    }
    return [_min, _max]
}

async function _Random(client : Discord.Client, message : Discord.Message, ...content : string[]){
    const bounds = get_min_max(...content)
    
    const val = RandInt(bounds[0], bounds[1])
    return message.channel.send(`Random Value : ${val}`)
}

export const Random = CommandConstructor(_Random, "Generate a random integer between given minimum and maximum values", [])
export const Random_Normal = CommandConstructor(_Random, "Generate a Normal distribution sample with given mean and variance", [])
export const Coin_Toss = CommandConstructor(_Random, "Random -> Heads or Tails", [])

export async function _Random_Normal(client : Discord.Client, message : Discord.Message, ...content : string[]){
    function get_args(...content : string[]){
        let _mean = 0
        let _std = 1
        if (content.length > 0){
            if (content.length == 1){
                try{
                    _mean = parseInt(content[0])
                }
                catch (err){
                    console.log(`Error ${err}`)
                }
            }
            if(content.length == 2){
                try{
                    _mean = parseInt(content[0])
                    _std = parseInt(content[1])
                }
                catch (err){
                    console.log(`Error ${err}`)
                }
            }
        }
        return [_mean, _std]
    }
    const args = get_args(...content)
    const val = Gaussian(args[0], args[1])
    return message.channel.send(`Random Value : ${val}`)
}

export async function _Coin_Toss(client : Discord.Client, message : Discord.Message, ...content : string[]){
    const val = RandInt(0, 1)
    let msg = "Tails"
    if (val == 1)
        msg = "Heads"
    return message.channel.send(`Coin Toss : ${msg}`)
}