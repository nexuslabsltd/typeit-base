const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { SafeInternal, Schema, TypeItError } = require('./schema');

// Promisified version of fs.readFile and fs.writeFile
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Default configuration structure
const defaultConfig = {
    "typeit": {
        "networkCheck": true,
        "isValid": true,
        "pollInterval": 5000,
        "endpoints": []
    }
};

// Define schema for validating configuration files
const configSchemaSpec = {
    typeit: {
        type: "object",
        networkCheck: { type: "boolean", optional: true },
        isValid: { type: "boolean", optional: true },
        pollInterval: { type: "number", optional: true },
        endpoints: { type: "array", items: "string", optional: true }
    }
};

class TypeItConfig {
    constructor(configPath) {
        this.configPath = configPath || path.resolve(process.cwd(), 'typeit.config.json');
        this._internalStorage = new SafeInternal();  // Safe storage for config data
        this.schemaValidator = new Schema(configSchemaSpec); // Schema instance for validation
    }

    async loadConfig() {
        try {
            const isJsonFile = this.configPath.endsWith('.json');
            if (!isJsonFile) throw new TypeItError('Config file must be a .json file');

            const fileContent = await readFileAsync(this.configPath, 'utf-8');
            if (!fileContent.trim() || fileContent === '{"typeit":{}}') {
                console.log('Config file is empty or invalid. Using default config.');
                return defaultConfig;
            }

            let parsedConfig;
            try {
                parsedConfig = JSON.parse(fileContent);
            } catch (error) {
                console.error('Error parsing config file:', error);
                return defaultConfig;
            }

            // Validate configuration against schema
            try {
                this.schemaValidator.validate(parsedConfig);
            } catch (error) {
                console.error('Invalid configuration:', error);
                return defaultConfig;
            }

            // Safely store the validated configuration
            this._internalStorage.set(this, 'config', parsedConfig);
            return parsedConfig;
        } catch (error) {
            console.error('Error loading config:', error);
            return defaultConfig;
        }
    }

    async getConfig() {
        const existingConfig = this._internalStorage.get(this);
        if (!existingConfig || !existingConfig.config) {
            const config = await this.loadConfig();
            this._internalStorage.set(this, 'config', config);
        }
        return this._internalStorage.get(this).config;
    }

    // createConfig: creates the config file if it doesn't already exist
    async createConfig() {
        try {
            // Check if config file already exists
            if (fs.existsSync(this.configPath)) {
                console.log('Config file already exists. Skipping creation.');
                return;
            }

            // Write default configuration to file
            await writeFileAsync(this.configPath, JSON.stringify(defaultConfig, null, 2));
            console.log(`Config file created at ${this.configPath} with default settings.`);
        } catch (error) {
            console.error('Error creating config file:', error);
        }
    }
}

// Export all as a module object
module.exports = {
    TypeItConfig
};
