"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const modularClient_1 = require("../services/modularClient");
// Example module application that demonstrates ModulaR integration
const app = (0, express_1.default)();
const port = process.env.MODULE_PORT || 3001;
app.use(express_1.default.json());
// Custom module configuration
const moduleConfig = {
    moduleId: 'example-module',
    moduleName: 'Example ModulaR Module',
    version: '1.0.0',
    description: 'An example module demonstrating ModulaR API integration',
    author: 'ModulaR Team',
    license: 'MIT',
    capabilities: [
        {
            name: 'data-processing',
            description: 'Process and transform data',
            version: '1.0.0',
            config: {
                maxFileSize: '10MB',
                supportedFormats: ['json', 'csv', 'xml']
            }
        },
        {
            name: 'user-management',
            description: 'Basic user operations',
            version: '1.0.0'
        }
    ],
    endpoints: [
        {
            path: '/status',
            method: 'GET',
            description: 'Get module status and health information',
            protected: false
        },
        {
            path: '/data',
            method: 'GET',
            description: 'Retrieve processed data',
            protected: true,
            params: [
                {
                    name: 'format',
                    type: 'string',
                    required: false,
                    description: 'Data format (json, csv, xml)',
                    default: 'json'
                }
            ]
        },
        {
            path: '/data',
            method: 'POST',
            description: 'Submit data for processing',
            protected: true,
            params: [
                {
                    name: 'data',
                    type: 'object',
                    required: true,
                    description: 'Data to be processed'
                }
            ]
        },
        {
            path: '/users',
            method: 'GET',
            description: 'Get user list',
            protected: true
        }
    ],
    dependencies: [
        {
            name: 'modular-cms',
            version: '>=2.0.0',
            required: true
        }
    ],
    metadata: {
        author: 'ModulaR Team',
        license: 'MIT',
        repository: 'https://github.com/modular/example-module',
        keywords: ['modular', 'cms', 'example'],
        createdAt: new Date().toISOString()
    }
};
// Create ModulaR client
const modularApiUrl = process.env.MODULAR_API_URL || 'http://localhost:7474/api/modular';
const modularClient = (0, modularClient_1.createModularClient)({
    apiUrl: modularApiUrl,
    moduleConfig,
    heartbeatInterval: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000
});
// In-memory data store for demonstration
let processedData = [];
let users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
];
// Module endpoints
app.get('/status', (req, res) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    res.json({
        moduleId: moduleConfig.moduleId,
        moduleName: moduleConfig.moduleName,
        version: moduleConfig.version,
        status: 'active',
        uptime: Math.floor(uptime),
        memory: {
            used: memoryUsage.heapUsed,
            total: memoryUsage.heapTotal,
            percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
        },
        isRegistered: modularClient.isModuleRegistered(),
        timestamp: new Date().toISOString(),
        endpoints: moduleConfig.endpoints.length,
        capabilities: moduleConfig.capabilities.map(c => c.name)
    });
});
app.get('/data', (req, res) => {
    const format = req.query.format || 'json';
    if (!['json', 'csv', 'xml'].includes(format)) {
        res.status(400).json({
            error: 'Unsupported format. Use json, csv, or xml.',
            supportedFormats: ['json', 'csv', 'xml']
        });
        return;
    }
    let responseData;
    switch (format) {
        case 'csv':
            const csvHeaders = 'id,data,processedAt\n';
            const csvRows = processedData.map(item => `${item.id},"${item.data}",${item.processedAt}`).join('\n');
            responseData = csvHeaders + csvRows;
            res.setHeader('Content-Type', 'text/csv');
            break;
        case 'xml':
            const xmlData = processedData.map(item => `<item><id>${item.id}</id><data>${item.data}</data><processedAt>${item.processedAt}</processedAt></item>`).join('');
            responseData = `<?xml version="1.0"?><data>${xmlData}</data>`;
            res.setHeader('Content-Type', 'application/xml');
            break;
        default: // json
            responseData = {
                moduleId: moduleConfig.moduleId,
                data: processedData,
                totalItems: processedData.length,
                format,
                timestamp: new Date().toISOString()
            };
            res.setHeader('Content-Type', 'application/json');
    }
    res.send(responseData);
});
app.post('/data', (req, res) => {
    const { data } = req.body;
    if (!data) {
        res.status(400).json({
            error: 'Data is required',
            example: { data: 'your data here' }
        });
        return;
    }
    // Simulate data processing
    const processedItem = {
        id: Date.now(),
        originalData: data,
        data: typeof data === 'string' ? data.toUpperCase() : JSON.stringify(data),
        processedAt: new Date().toISOString(),
        processingTime: Math.random() * 100 + 50 // Simulate processing time
    };
    processedData.push(processedItem);
    // Keep only last 100 items
    if (processedData.length > 100) {
        processedData = processedData.slice(-100);
    }
    res.status(201).json({
        message: 'Data processed successfully',
        processedItem,
        totalProcessedItems: processedData.length
    });
});
app.get('/users', (req, res) => {
    res.json({
        moduleId: moduleConfig.moduleId,
        users,
        totalUsers: users.length,
        timestamp: new Date().toISOString()
    });
});
// Add a user endpoint for demonstration
app.post('/users', (req, res) => {
    const { name, email, role = 'user' } = req.body;
    if (!name || !email) {
        res.status(400).json({
            error: 'Name and email are required',
            example: { name: 'John Doe', email: 'john@example.com', role: 'user' }
        });
        return;
    }
    const newUser = {
        id: users.length + 1,
        name,
        email,
        role
    };
    users.push(newUser);
    res.status(201).json({
        message: 'User created successfully',
        user: newUser,
        totalUsers: users.length
    });
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        moduleId: moduleConfig.moduleId,
        timestamp: new Date().toISOString()
    });
});
// ModulaR client event handlers
modularClient.on('registered', (data) => {
    console.log('✅ Successfully registered with ModulaR CMS:', data);
});
modularClient.on('registrationFailed', (error) => {
    console.error('❌ Failed to register with ModulaR CMS:', error.message);
});
modularClient.on('heartbeatSent', (data) => {
    console.log('💓 Heartbeat sent to ModulaR CMS');
});
modularClient.on('heartbeatFailed', (error) => {
    console.error('💔 Heartbeat failed:', error.message);
});
modularClient.on('communicationReceived', (data) => {
    console.log('📨 Communication received from ModulaR CMS:', data);
});
modularClient.on('unregistered', (data) => {
    console.log('🔌 Unregistered from ModulaR CMS:', data);
});
// Start the module
app.listen(port, async () => {
    console.log(`\n🚀 Example ModulaR Module started on port ${port}`);
    console.log(`📋 Module ID: ${moduleConfig.moduleId}`);
    console.log(`📝 Module Name: ${moduleConfig.moduleName}`);
    console.log(`🔗 ModulaR API URL: ${modularApiUrl}`);
    console.log('\n📍 Available endpoints:');
    console.log(`   GET  http://localhost:${port}/status - Module status`);
    console.log(`   GET  http://localhost:${port}/data - Get processed data`);
    console.log(`   POST http://localhost:${port}/data - Submit data for processing`);
    console.log(`   GET  http://localhost:${port}/users - Get users`);
    console.log(`   POST http://localhost:${port}/users - Create user`);
    console.log(`   GET  http://localhost:${port}/health - Health check`);
    // Register with ModulaR CMS
    console.log('\n🔗 Registering with ModulaR CMS...');
    try {
        const result = await modularClient.register();
        if (result.success) {
            console.log('✅ Registration successful!');
        }
        else {
            console.error('❌ Registration failed:', result.error);
        }
    }
    catch (error) {
        console.error('❌ Failed to register with ModulaR CMS:', error?.message || 'Unknown error');
        console.log('ℹ️  Module will continue running without ModulaR integration');
    }
});
// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
    try {
        if (modularClient.isModuleRegistered()) {
            console.log('🔌 Unregistering from ModulaR CMS...');
            await modularClient.shutdown();
            console.log('✅ Successfully unregistered from ModulaR CMS');
        }
    }
    catch (error) {
        console.error('❌ Error during shutdown:', error?.message || 'Unknown error');
    }
    console.log('👋 Example module shutdown complete');
    process.exit(0);
};
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});
exports.default = app;
//# sourceMappingURL=exampleModule.js.map