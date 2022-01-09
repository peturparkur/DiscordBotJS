import fs from "fs"; //file system
export function Mention(user) {
    return `<@${user.id}>`;
}
/**
* Construct Date-like structure from utc number -> interpret as time spent from 0
* @param dt Time delta
* @returns \{days, hours, minutes, seconds} : additive
*/
export function DeltaTime(dt) {
    // time is measured in milli seconds
    // 1000dt = 1s
    // 60000dt => 1min
    // 3,600,000dt => 1h
    // 86,400,000dt = 1day
    let diffDays = Math.floor(dt / (86400 * 1000));
    dt -= diffDays * (86400 * 1000);
    let diffHrs = Math.floor(dt / (3600 * 1000));
    dt -= diffHrs * (3600 * 1000);
    let diffMins = Math.floor(dt / (60 * 1000));
    dt -= diffMins * (60 * 1000);
    let diffSeconds = Math.floor(dt / (1000));
    return {
        "days": diffDays,
        "hours": diffHrs,
        "minutes": diffMins,
        "seconds": diffSeconds,
        'raw': dt
    };
}
export function FileExists(filename, path) {
    return fs.existsSync(path + "/" + filename);
}
export function Map2Obj(map) {
    return Object.fromEntries(map);
}
export function Obj2Map(obj) {
    console.log(obj);
    if (obj == undefined)
        return null;
    return new Map(Object.entries(obj));
}
export function SaveObjectJson(obj, filename, path, create_path = true) {
    const data = JSON.stringify(obj);
    if (!fs.existsSync(path)) {
        if (create_path)
            fs.mkdir(path, (error) => {
                if (error) {
                    console.log(`Error occured when creating path ${path} -> ${error}`);
                    return false;
                }
            });
        else
            return false;
    }
    fs.writeFile(path + "/" + filename + ".json", data, (err) => {
        if (err) {
            console.log(`Error occured while writing file[${filename}] to path[${path}] -> ${err}`);
            return false;
        }
    });
    return true;
}
export function LoadObjectJson(filename, path) {
    if (!fs.existsSync(path + "/" + filename + ".json")) {
        //throw new Error(`path[${path}] doesn't exists`) // path doesn't exists
        console.log(`path[${path + "/" + filename + ".json"}] doesn't exists`);
        return null;
    }
    const data = fs.readFileSync(path + "/" + filename + ".json");
    return JSON.parse(data.toString());
}
