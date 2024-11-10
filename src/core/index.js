const observer = require('./observer'); 
const parser = require('./parser');
const schema = require('./schema')
const utils = require('./utils');
const typeit = require('./typeit');


// Re-export all in a single
// module object
module.exports = {
    ...typeit,
    ...parser,
    ...utils,
    ...schema,
    ...observer
};

