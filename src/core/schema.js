// TypeItError class for handling parsing errors specifically
class TypeItError extends Error {
    constructor(message) {
        super(message);
        this.name = "TypeItError";
        this.message = message || "Type parsing failed";
    }
}

// SchemaValidatorError for handling schema validation errors specifically
class SchemaValidatorError extends Error {
    constructor(message) {
        super(message);
        this.name = "SchemaValidatorError";
        this.message = message || "Schema validation failed";
    }
}

// Safe Internal Class to Handle Map Operations and Avoid Prototype Pollution
class SafeInternal {
    constructor() {
        this.data = new WeakMap();  // Manage references safely
    }

    set(thisArg, key, value) {
        const cleanMap = Object.create(null); // No prototype, to prevent prototype pollution
        Object.freeze(cleanMap); // Make it immutable

        if (thisArg.hasOwnProperty(key)) {
            return thisArg[key];  // Return existing value if key exists
        }

        thisArg[key] = value;
        this.data.set(thisArg, cleanMap); // Store map in WeakMap for memory safety
        return thisArg[key];
    }

    get(thisArg) {
        return this.data.get(thisArg);
    }
}

// Schema class for deep object validation against a schema
class Schema {
    constructor(schemaSpec, customTypes = {}) {
        this.schemaSpec = schemaSpec;
        this.customTypes = customTypes;
    }

    // Recursive validation supporting nested objects, custom types, regex, conditionals, and messages
    validate(obj) {
        for (const [key, spec] of Object.entries(this.schemaSpec)) {
            const actualValue = obj[key];
            const expectedType = typeof spec === 'string' ? spec : spec.type;
            const isOptional = spec.optional && actualValue === undefined;

            if (isOptional) continue;  // Skip validation if optional and undefined

            // Custom Types
            if (this.customTypes[expectedType] && !this.customTypes[expectedType](actualValue)) {
                throw new SchemaValidatorError(spec.message || `Invalid type for ${key}`);
            }

            // Regular Expression
            if (expectedType instanceof RegExp && !expectedType.test(actualValue)) {
                throw new SchemaValidatorError(spec.message || `Invalid format for ${key}`);
            }

            // Conditionals
            if (spec.condition && !spec.condition(obj)) {
                continue;  // Skip validation based on condition
            }

            // Recursive Validation for Nested Objects
            if (typeof spec === 'object' && !Array.isArray(spec) && !this.customTypes[expectedType]) {
                new Schema(spec).validate(actualValue);  // Recurse for nested validation
            } else if (Array.isArray(actualValue)) {
                if (spec.items) {
                    // Validate array items
                    actualValue.forEach(item => {
                        if (typeof item !== spec.items) {
                            throw new SchemaValidatorError(`Expected ${spec.items} in array for key ${key}`);
                        }
                    });
                }
            } else if (typeof actualValue !== expectedType) {
                throw new SchemaValidatorError(spec.message || `Expected ${expectedType} for key ${key}, but got ${typeof actualValue}`);
            }
        }
        return true;
    }
}


function assertType(value, typeChecker) {
    if (!typeChecker(value)) {
        throw new TypeItError(`Expected type ${typeChecker.name}, but got ${typeof value}`);
    }
    return value;
}


module.exports = {SafeInternal,Schema,TypeItError,Schema}