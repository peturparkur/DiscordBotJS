/**
 * Register and Emit events within an instance
 *
 */
class EventHandler {
    /**
     * Creates an EventHandler which can register and emit events
     */
    constructor() {
        this.listeners = new Map();
    }
    /**
     * Adds the function as an event listener
     * @param type what event name to register to
     * @param callback function/s to call
     */
    addEventListener(type, callback) {
        var _a;
        if (!this.listeners.has(type)) {
            this.listeners.set(type, []); //No event with this name => Add new array of functions
        }
        (_a = this.listeners.get(type)) === null || _a === void 0 ? void 0 : _a.push(callback);
    }
    /**
     * Remove the function as an event listener
     * @param type what event name to remove it from
     * @param callback function/s to remove
     */
    removeEventListener(type, callback) {
        if (!this.listeners.has(type)) //No event with this name
            return;
        let funcs = this.listeners.get(type);
        let i = funcs.indexOf(callback);
        funcs.splice(i, 1);
        this.listeners.set(type, funcs);
    }
    /**
     * Clears all callback functions for a given event name
     * @param type event name
     */
    clearEvent(type) {
        return this.listeners.delete(type);
    }
    /**
     * Calls the event registered under given type as event(data)
     * @param type what emit event we call
     * @param data data to pass to event argument
     */
    emit(type, ...data) {
        var _a, _b;
        if (!this.listeners.has(type)) // No Event with this name
            return;
        if (data != null) {
            (_a = this.listeners.get(type)) === null || _a === void 0 ? void 0 : _a.forEach((func) => { func.call(this, ...data); }); //call all functions
        }
        else {
            (_b = this.listeners.get(type)) === null || _b === void 0 ? void 0 : _b.forEach((func) => { func.call(this); }); //call all functions
        }
    }
}
export { EventHandler };
