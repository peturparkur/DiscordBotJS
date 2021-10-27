class EventHandler {
    constructor() {
        this.listeners = new Map();
    }
    addEventListener(type, callback) {
        var _a;
        if (!this.listeners.has(type)) {
            this.listeners.set(type, []); //No event with this name => Add new array of functions
        }
        (_a = this.listeners.get(type)) === null || _a === void 0 ? void 0 : _a.push(callback);
    }
    removeEventListener(type, callback) {
        if (!this.listeners.has(type)) //No event with this name
            return;
        let funcs = this.listeners.get(type);
        let i = funcs.indexOf(callback);
        funcs.splice(i, 1);
        this.listeners.set(type, funcs);
    }
    dispatchEvent(type, ...args) {
        var _a, _b;
        if (!this.listeners.has(type)) // No Event with this name
            return 1; //didn't find the call
        if (args.length > 0) {
            (_a = this.listeners.get(type)) === null || _a === void 0 ? void 0 : _a.forEach((func) => { func.call(this, args); }); //call all functions
        }
        else {
            (_b = this.listeners.get(type)) === null || _b === void 0 ? void 0 : _b.forEach((func) => { func.call(this); }); //call all functions
        }
        return 0;
    }
}
class Room extends EventHandler {
    constructor(_members = new Array()) {
        super();
        this.members = _members.slice(0, _members.length); //copy
    }
    AddMember(member) {
        if (this.members.indexOf(member) < 0)
            return 1;
        this.members.push(member);
        return 0;
    }
    GetIndex(member) {
        return this.members.indexOf(member);
    }
    HasMember(member) {
        return this.members.indexOf(member) < 0 ? false : true;
    }
}
export { EventHandler, Room };
