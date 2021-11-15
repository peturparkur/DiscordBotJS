import * as Discord from "discord.js"
import { Gaussian, RandInt } from "../../../utility/putil_maths.js"

export async function Random(client : Discord.Client, message : Discord.Message, ...content : string[]){
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
    const bounds = get_min_max(...content)
    
    const val = RandInt(bounds[0], bounds[1])
    await message.channel.send(`Random Value : ${val}`)
}

export async function Random_Normal(client : Discord.Client, message : Discord.Message, ...content : string[]){
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
    await message.channel.send(`Random Value : ${val}`)
}