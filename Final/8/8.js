const object = {
    count: 8, 
    isValid: true, 
    title: "Exam", 
    temperature: 87.88
};

const { title } = object;

console.log("title, except to be 'Exam'.", title);

module.exports = title;