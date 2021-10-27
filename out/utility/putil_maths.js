function Clamp(x, a = 0, b = 1) {
    return Math.max(Math.min(x, b), a);
}
function RandomChoice(items) {
    return items[Math.floor(Math.random() * items.length)];
}
