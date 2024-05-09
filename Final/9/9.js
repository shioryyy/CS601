let colors = new Set(["orange", "grey", "purple", "cyan", "red", "green", "blue", "gold", "pink", "yellow", "white", "garnet"]);
let colorMap = new Map();

Array.from(colors).forEach((color, index) => {
    if (color.startsWith('g')) {
        colorMap.set(index, color);
    }
});

console.log("colors", colors);
console.log("colorMap", colorMap);

module.exports = colorMap;