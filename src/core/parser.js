// Primitive Types (Example - Define your primitives here)
const PrimitiveTypes = Object.freeze({
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    NULL: 'null',
    UNDEFINED: 'undefined',
});

// Reference Types (Example - Define your references here)
const ReferenceTypes = Object.freeze({
    OBJECT: 'object',
    ARRAY: 'array',
    FUNCTION: 'function',
});

// Composite Types (Example - Define your composites here)
const CompositeTypes = Object.freeze({
    MAP: 'map',
    SET: 'set',
    DATE: 'date',
});

// Combined Types Enum (adds all types, including primitives, references, and composites)
const Types = Object.freeze({
    ...PrimitiveTypes,
    ...ReferenceTypes,
    ...CompositeTypes
});

// TypeItParser class that parses and validates types
class TypeItParser {
    constructor(typeSpec, value) {
        this.typeSpec = typeSpec;
        this.value = value;
        this.tokenizer = new TypeItTokenizer(typeSpec, value);
        this.schema = new Schema(typeSpec);  // Uses schema validation for deep checks
    }

    // Tokenize the type specification and value
    tokenize() {
        this.tokenizer.tokenize();
    }

    // Perform parsing and validation for types and values
    parse() {
        this.tokenize();
        this.schema.validate(this.value); // Validate using the schema
        return this.evaluate();
    }

    // Extended evaluation logic (for future enhancements)
    evaluate() {
        return this.tokenizer.tokens.map(token => `${token} evaluated`);
    }

    // Handle circular references using the SafeInternal class
    handleCircularReferences(value, parentObjects = new Set()) {
        if (value && typeof value === 'object') {
            if (parentObjects.has(value)) {
                return '[Circular]';  // Circular reference marker
            }
            parentObjects.add(value);
            for (const key in value) {
                value[key] = this.handleCircularReferences(value[key], parentObjects);
            }
        }
        return value;
    }
}

// TypeItTokenizer class to handle tokenization 
// ,and type checks
class TypeItTokenizer {
    constructor(typeSpec, value) {
        this.typeSpec = typeSpec;
        this.value = value;
        this.tokens = [];
    }

    // Tokenize the type specification string
    tokenize() {
        this.tokens = this.typeSpec.split(',').map(type => type.trim());
    }

    // Reduce function for token sequence, to match token types
    reduce(stack) {
        const top = stack[stack.length - 1];
        return top === this.tokens[stack.length];
    }

    // Proxy function that returns a string representation of a type
    toString() {
        return this.tokens.join(", ");
    }
}

// TypeSpec class for mediator role
class TypeSpec {
    constructor(typeSpec, value) {
        this.parser = new TypeItParser(typeSpec, value);
    }

    // Mediator method to manage the type checking and parsing flow
    process() {
        try {
            this.parser.parse();  // Perform parsing and validation
        } catch (error) {
            if (error instanceof SchemaValidatorError) {
                throw new SchemaValidatorError(`Schema validation error: ${error.message}`);
            }
            if (error instanceof TypeItError) {
                throw new TypeItError(`Type parsing error: ${error.message}`);
            }
            throw error;  // Rethrow if it's a different error
        }
    }
}


// Proxy function that returns a string representation of a type
function createTypeStringProxy(typeSpec, value) {
    const tokenizer = new TypeItTokenizer(typeSpec, value);
    tokenizer.tokenize();

    return new Proxy(tokenizer, {
        get(target, prop) {
            if (prop === 'toString') {
                return target.toString();
            }
            return target[prop];
        }
    });
}
// Export classes and utility functions
module.exports = {
    TypeItParser,
    TypeItTokenizer,
    createTypeStringProxy,
    TypeSpec,
    ...Types,
    
};






