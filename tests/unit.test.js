const assert = require('assert');
const { TypeItObserver, TypeItSubscriber, PromiseStatus } = require('../src/core/index');

describe('TypeItObserver and TypeItSubscriber', function () {
    let subject;
    let observer;
    let testObject;
    let typeSpec;

    
    beforeEach(() => {
        subject = new TypeItSubscriber();
        observer = new TypeItObserver();
        subject.subscribe(observer);
    
        testObject = {
            name: 'Luke Skywalker',
            height: 172,
            starships: ['T-65 X-wing starfighter', 'Imperial shuttle']
        };
    
        typeSpec = {
            name: 'string',
            height: 'number',
            starships: 'object'
        };
    });
    
    describe('#observe', function () {
        it('should validate the object according to the typeSpec', function (done) {
            // Run the observer validation method and verify success
            observer.observe(testObject, typeSpec, subject)
                .then(validationResults => {
                    validationResults.forEach(result => {
                        if (result.status !== PromiseStatus.SUCCESS) {
                            done(new Error(`Validation failed for ${result.key}: ${result.error || result.status}`));
                        }
                    });
                    done();  // Complete the test successfully
                })
                .catch(error => {
                    done(error);  // Fail the test if validation fails unexpectedly
                });
        });

        it('should throw an error if the typeSpec is invalid', function (done) {
            const invalidTypeSpec = 'invalidType';  // Intentionally invalid typeSpec

            // Test with invalid typeSpec to check for expected error
            observer.observe(testObject, invalidTypeSpec, subject)
                .then(() => {
                    done(new Error('Validation should fail with an invalid typeSpec'));
                })
                .catch(error => {
                    assert.ok(error, 'Error should be thrown for invalid typeSpec');
                    done();  // Complete the test on expected failure
                });
        });

        it('should return failure status for type mismatches', function (done) {
            const incorrectTypeSpec = {
                name: 'number',  // 'name' should be a string, but we set it to number
                height: 'number',  // Correct type
                starships: 'object'  // Correct type
            };

            observer.observe(testObject, incorrectTypeSpec, subject)
                .then(validationResults => {
                    const nameResult = validationResults.find(result => result.key === 'name');
                    assert.strictEqual(nameResult.status, PromiseStatus.FAILURE, 'Expected failure for invalid type');
                    done();  // Complete the test successfully
                })
                .catch(error => {
                    done(error);  // Fail the test if validation fails unexpectedly
                });
        });

        it('should notify subscribers of validation errors', function (done) {
            const errorTypeSpec = {
                name: 'string', // Correct type
                height: 'string',  // Incorrect type: should be number
                starships: 'object'  // Correct type
            };

            // Mock the observer's update method to catch notifications
            observer.update = (message) => {
                assert.strictEqual(message, 'Error validating height: Type mismatch for key: height', 'Observer should be notified of validation error');
                done();  // Complete the test successfully
            };

            observer.observe(testObject, errorTypeSpec, subject);  // This should trigger the notification
        });
    });
});
