import {createCanvas} from 'canvas'
import * as fs from 'fs';

const canvas = createCanvas(100, 100);
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'red';
ctx.fillRect(50, 50, 20, 20);

let buffer = canvas.toBuffer('image/png');
fs.writeFileSync('./image.png', buffer);