const TypeIt = require('./');
const path = require('path');

async function main() {
    try {
        const configPath = process.argv[2] ?? path.resolve(process.cwd())
        const config = await TypeIt.initialize(configPath);

        console.log('Configuration loaded:', config);
    } catch (error) {
        console.error('Failed to load configuration:', error);
    }
}

main();
