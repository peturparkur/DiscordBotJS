function Clamp(x, a = 0, b = 1) {
    return Math.max(Math.min(x, b), a);
}
function RandomChoice(items) {
    return items[Math.floor(Math.random() * items.length)];
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
function RollArray(arr, offset = 1) {
    if (offset === 0)
        return;
    // offset > 0, means roll it to left
    // ofset < 0 means roll it to right
    if (offset > 0) {
        for (let i = 0; i < offset; i++) {
            let x = arr.shift();
            arr.push(x);
        }
        return;
    }
    else {
        offset = -offset;
        for (let i = 0; i < offset; i++) {
            let x = arr.pop();
            arr.unshift(x);
        }
    }
}
export { RollArray, Clamp, RandomChoice };
