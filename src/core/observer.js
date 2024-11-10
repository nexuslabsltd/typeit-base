// Define PromiseStatus enum for promise states
const PromiseStatus = Object.freeze({
    PENDING: 'pending',    // The promise is still in progress
    SUCCESS: 'success',    // The promise was resolved successfully
    ERROR: 'error',        // The promise was rejected with an error
    FAILURE: 'failure',    // The promise failed due to some issue in the observer logic
});

class TypeItSubscriber {
    constructor() {
        this.observers = [];  // Collection of observers
    }

    subscribe(observer) {
        if (observer && typeof observer.update === 'function') {
            this.observers.push(observer);
        } else {
            throw new TypeError('Observer must implement an update method');
        }
    }

    unsubscribe(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    // Notify all observers, passing along status-enhanced data
    notify(data) {
        this.observers.forEach(observer => observer.update(data));
    }
}
class TypeItObserver {
    constructor() {
        this.data = {};
    }

    // Method to observe and validate data according to typeSpec
    async observe(value, typeSpec, subject) {
        const observedResults = [];
        
        // Check if typeSpec is an object; if not, throw an error
        if (typeof typeSpec !== 'object' || typeSpec === null) {
            throw new TypeError('typeSpec must be an object');
        }

        if (value && typeof value === 'object') {
            for (const key in typeSpec) {
                const expectedType = typeSpec[key];
                const propertyResult = { key, status: PromiseStatus.PENDING, value: null };

                try {
                    const actualValue = value[key];
                    const actualType = Array.isArray(actualValue) ? 'object' : typeof actualValue;

                    if (actualType === expectedType) {
                        propertyResult.status = PromiseStatus.SUCCESS;
                        propertyResult.value = actualValue;
                    } else {
                        throw new Error(`Type mismatch for key: ${key}`);
                    }
                } catch (error) {
                    propertyResult.status = PromiseStatus.FAILURE;
                    propertyResult.error = `Error validating ${key}: ${error.message}`;
                    subject.notify(propertyResult.error);  // Notify on failure
                }
                observedResults.push(propertyResult);
            }
        }

        return observedResults;
    }

    // Observer receives data and performs an action
    update(data) {
        this.data = data;
        console.log(`TypeItObserver received data: ${JSON.stringify(data)}`);
    }
}


// Error class for specific validation or type errors
class TypeItError extends Error {
    constructor(message) {
        super(message);
        this.name = "TypeItError";
    }

    toString() {
        return `${this.name}: ${this.message}`;
    }
}

// Export the classes and the PromiseStatus enum
module.exports = {
    TypeItObserver,
    TypeItSubscriber,
    TypeItError,
    PromiseStatus
};
