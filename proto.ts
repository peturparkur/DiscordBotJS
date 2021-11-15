interface descriptive{
    description : string
}

type callable = {
    description : string;
    (arg : number) : number;
}

let f = (...args : number[]) => {
    let s = 0
    for(const x of args){
        s += x
    }
    return s
}

async function ff(...args : string[]){
    let s = ""
    for(const x of args){
        s += x
    }
    return s
}

type special_func = (...args : any[]) => any

class Command2 extends Function{
    description : string = ""
    function : special_func
    constructor(f : special_func, desc : string = ""){
        super()
        this.function = f
        this.description = desc
    }

    call(this, ...argArray: any[]) {
        return this.function(...argArray)
    }
    
}

type FunctionPlus = {
    description : string;
    (arg : any, ...args : any[]) : any;
}

function test(a : string, b : string, c : string, ...rest : string[]){
    console.log(`a[${a}], b[${b}], c[${c}], rest[${rest}]`)
}

let f2 = (x : number) => {return x*x}
const callbble = (x : number)=>{return 2*x}
const callble : callable = callbble as callable
callble.description = "hello"

test("1", "2", "3", "9", "8", "7")
let func = new Command2(f)
let func2 = new Command2(ff)
console.log(callble(3))
console.log(func.call(1, 2, 3))
console.log(func2.call(1, 2, 3))
console.log(typeof(f))
console.log(f)
console.log(f(1, 2, 3))