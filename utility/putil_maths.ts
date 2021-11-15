function Clamp(x : number, a : number = 0, b : number = 1){
    return Math.max(Math.min(x, b), a)
}

function RandomChoice<T>(items : Array<T>){
    return items[Math.floor(Math.random() * items.length)]
}

/**
 * Shifts the elements of the array by offset, if an array element is outside of array range it rolls it back around
 * 
 * offset > 0 => roll it towards 0
 * 
 * offset > 0 => roll it away from 0
 * @param arr Array to apply transformation on
 * @param offset Amount to shift
 */
 function RollArray(arr : Array<any>, offset : number = 1){
    if(offset === 0) return;
    // offset > 0, means roll it to left
    // ofset < 0 means roll it to right

    if(offset > 0){
        for(let i=0; i<offset; i++){
            let x = arr.shift();
            arr.push(x)
        }
        return;
    }
    else{
        offset = -offset;
        for(let i=0; i<offset; i++){
            let x = arr.pop();
            arr.unshift(x);
        }
    }
}
/**
 * 
 * @param min inclusive minimum
 * @param max inclusive maximum
 * @returns random integer in range [min, max]
 */
function RandInt(min : number = 0, max : number = 1){
    return Math.floor(Math.random() * (max + 1 - min) + min)
}

/**
 * Standard Normal variate using Box-Muller transform.
 * @param mean mean
 * @param std standard deviation
 * @returns Gaussian Distribution N(mean, std)
 */
function Gaussian(mean : number = 0, std : number = 1){
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let val = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    return val * std + mean
}

export {RollArray, Clamp, RandomChoice, Gaussian, RandInt}