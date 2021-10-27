function Clamp(x : number, a : number = 0, b : number = 1){
    return Math.max(Math.min(x, b), a)
}

function RandomChoice<T>(items : Array<T>){
    return items[Math.floor(Math.random() * items.length)]
}