const {TypeSpec} =require("./core/index");

// Example usage of TypeSpec as mediator
function run() {
    const typeSpec = {
        name: 'string',
        age: { type: 'number', optional: true },
        hobbies: { type: 'array', items: 'string' },
    };

    const value = {
        name: 'John Doe',
        age: 30,
        hobbies: ['Reading', 'Coding'],
    };

    const typeSpecMediator = new TypeSpec(typeSpec, value);
    typeSpecMediator.process();
}

run();