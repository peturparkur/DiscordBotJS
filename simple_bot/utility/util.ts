import * as Discord from "discord.js";
import fs from "fs" //file system

export function Mention(user : Discord.User){
    return `<@${user.id}>`
}

export function FileExists(filename : string, path : string){
    return fs.existsSync(path + "/" + filename)
}

export function Map2Obj<T>(map : Map<string, T>)
{
    return Object.fromEntries(map)
}

export function Obj2Map<T>(obj : Object)
{
    return new Map<string, T>(Object.entries(obj))
}

export function SaveObjectJson(obj : Object, filename : string, path : string, create_path : boolean = true)
{
    const data = JSON.stringify(obj)
    if(!fs.existsSync(path)){
        if(create_path)
            fs.mkdir(path, (error) => {
                console.log(`Error occured when creating path ${path} -> ${error}`)
                return false;
            })
        else
            return false;
    }
    fs.writeFile(path + "/" + filename + ".json", data, (err) => {
        console.log(`Error occured while writing file[${filename}] to path[${path}] -> ${err}`)
        return false
    })
    return true
}

export function LoadObjectJson(filename : string, path : string) : Object
{
    if(!fs.existsSync(path)){
        //throw new Error(`path[${path}] doesn't exists`) // path doesn't exists
        console.log(`path[${path}] doesn't exists`)
        return null
    }
    fs.readFile(path + "/" + filename + ".json", (err, data) => {
        if(err)
        {
            console.log(`Error Occured in loading file[${filename}] from path[${path}] -> ${err}`)
            return null
            //throw new Error(`Error Occured in loading file[${filename}] from path[${path}] -> ${err}`)
        }
        return JSON.parse(data.toString())
    })
}
