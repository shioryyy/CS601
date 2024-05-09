function get3Segments(input: number[] | string): boolean {
    return Array.isArray(input);
}

console.log("[1, 2, 3]", get3Segments([1, 2, 3]));
console.log("Hello", get3Segments("Hello"));
console.log("123", get3Segments("123"));

module.exports = get3Segments;