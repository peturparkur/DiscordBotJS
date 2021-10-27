/**
 * Register and Emit events within an instance
 * 
 */
 class EventHandler{
    listeners : Map<string, Function[]>

    /**
     * Creates an EventHandler which can register and emit events
     */
    constructor(){
        this.listeners = new Map<string, Array<Function>>()
    }

    /**
     * Adds the function as an event listener
     * @param type what event name to register to
     * @param callback function/s to call
     */
    addEventListener(type : string, callback : Function){
        if (!this.listeners.has(type)){
            this.listeners.set(type, []); //No event with this name => Add new array of functions
        }
        this.listeners.get(type)?.push(callback);
    }

    /**
     * Remove the function as an event listener
     * @param type what event name to remove it from
     * @param callback function/s to remove
     */
    removeEventListener(type : string, callback : Function){
        if(!this.listeners.has(type)) //No event with this name
            return;
        
        let funcs = this.listeners.get(type)!;
        let i = funcs.indexOf(callback)
        funcs.splice(i, 1)
        this.listeners.set(type, funcs);
    }

    /**
     * Clears all callback functions for a given event name
     * @param type event name
     */
    clearEvent(type : string){
        return this.listeners.delete(type)
    }

    /**
     * Calls the event registered under given type as event(data)
     * @param type what emit event we call
     * @param data data to pass to event argument
     */
    emit(type : string, ...data : any[]){
        if(!this.listeners.has(type)) // No Event with this name
            return;
        if(data != null){
            this.listeners.get(type)?.forEach((func) => {func.call(this, ...data)}) //call all functions
        }
        else{
            this.listeners.get(type)?.forEach((func) => {func.call(this)}) //call all functions
        }
    }
}

export {EventHandler}