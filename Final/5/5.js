class Person {
    #SSN;

    fullName;

    constructor(SSN = '000-00-0000', fullName = 'N/A') {
        this.#SSN = SSN;
        this.fullName = fullName;
    }

    getSSN() {
        return this.#SSN;
    }
}

const testPerson1 = new Person('123-45-6789', 'Andrew Sheehan');
console.log(`Full Name: ${testPerson1.fullName}, SSN: ${testPerson1.getSSN()}`);

const testPerson2 = new Person();
console.log(`Full Name: ${testPerson2.fullName}, SSN: ${testPerson2.getSSN()}`);

module.exports = Person;