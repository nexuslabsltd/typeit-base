const TypeItConfig = require('./typeit');

// Type Checkers for Primitive Types
const primitiveTypeCheckers = {
    isString: (value) => typeof value === 'string',
    isNumber: (value) => typeof value === 'number',
    isBoolean: (value) => typeof value === 'boolean',
    isFunction: (value) => typeof value === 'function',
    isNull: (value) => value === null,
    isUndefined: (value) => value === undefined,
    isSymbol: (value) => typeof value === 'symbol',
    isBigInt: (value) => typeof value === 'bigint',
    isVoid: (value) => value === undefined,
    isNever: (value) => false // "never" type is a special case and is never valid
};

// Type Checkers for Complex Types
const complexTypeCheckers = {
    isArray: (value) => Array.isArray(value),
    isDate: (value) => value instanceof Date,
    isRegExp: (value) => value instanceof RegExp,
    isMap: (value) => value instanceof Map,
    isSet: (value) => value instanceof Set,
    isPromise: (value) => value instanceof Promise,
    isIterable: (value) => value != null && typeof value[Symbol.iterator] === 'function',
    isFile: (value) => value instanceof File,
    isBlob: (value) => value instanceof Blob
};

// Combined Checkers (Primitive + Complex)
const typeCheckers = {
    ...primitiveTypeCheckers,
    ...complexTypeCheckers
};

// Higher-order function to create flexible
// type-check functions
function createChecker(typeSpec) {
    return async function (value) {
        return await typeIt(value, typeSpec);
    };
}


module.exports = {
    ...primitiveTypeCheckers,
    ...complexTypeCheckers,
    typeCheckers,
    createChecker,
    createConfig: async (configPath) => {
        const config = new TypeItConfig(configPath);
        await config.createConfig();
    }
};
