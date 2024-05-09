const Person = require('./5');

test("testPerson1", () => {
    const testPerson1 = new Person('123-45-6789', 'Andrew Sheehan');
    expect(testPerson1.fullName).toBe('Andrew Sheehan');
    expect(testPerson1.getSSN()).toBe('123-45-6789');
}
);

test("testPerson2", () => {
    const testPerson2 = new Person();
    expect(testPerson2.fullName).toBe('N/A');
    expect(testPerson2.getSSN()).toBe('000-00-0000');
}
);