const colorMap = require('./9');

//let colors = new Set(["orange", "grey", "purple", "cyan", "red", "green", "blue", "gold", "pink", "yellow", "white", "garnet"]);
//let colorMap = new Map();
test("testColorMap", () => {
    expect(colorMap.get(0)).toBe(undefined);
    expect(colorMap.get(1)).toBe("grey");
    expect(colorMap.get(2)).toBe(undefined);
    expect(colorMap.get(3)).toBe(undefined);
    expect(colorMap.get(4)).toBe(undefined);
    expect(colorMap.get(5)).toBe("green");
    expect(colorMap.get(6)).toBe(undefined);
    expect(colorMap.get(7)).toBe("gold");
    expect(colorMap.get(8)).toBe(undefined);
    expect(colorMap.get(9)).toBe(undefined);
    expect(colorMap.get(10)).toBe(undefined);
    expect(colorMap.get(11)).toBe("garnet");
}
);