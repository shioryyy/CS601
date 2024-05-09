const get3Segments = require('./10');

test("test1", () => {
    expect(get3Segments([1, 2, 3])).toBe(true);
}
);

test("test2", () => {
    expect(get3Segments("test")).toBe(false);
}
);

test("test3", () => {
    expect(get3Segments(123)).toBe(false);
}
);