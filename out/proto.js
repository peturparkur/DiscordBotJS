var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let f = (...args) => {
    let s = 0;
    for (const x of args) {
        s += x;
    }
    return s;
};
function ff(...args) {
    return __awaiter(this, void 0, void 0, function* () {
        let s = "";
        for (const x of args) {
            s += x;
        }
        return s;
    });
}
class Command2 extends Function {
    constructor(f, desc = "") {
        super();
        this.description = "";
        this.function = f;
        this.description = desc;
    }
    call(...argArray) {
        return this.function(...argArray);
    }
}
function test(a, b, c, ...rest) {
    console.log(`a[${a}], b[${b}], c[${c}], rest[${rest}]`);
}
let f2 = (x) => { return x * x; };
const callbble = (x) => { return 2 * x; };
const callble = callbble;
callble.description = "hello";
test("1", "2", "3", "9", "8", "7");
let func = new Command2(f);
let func2 = new Command2(ff);
console.log(callble(3));
console.log(func.call(1, 2, 3));
console.log(func2.call(1, 2, 3));
console.log(typeof (f));
console.log(f);
console.log(f(1, 2, 3));
