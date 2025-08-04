"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modularCMS = exports.ModularCMS = exports.modularApiRouter = exports.ModularClient = exports.createExampleModuleConfig = exports.createModularClient = exports.modularService = exports.app = exports.PORT = void 0;
exports.createModularApp = createModularApp;
exports.startModularServer = startModularServer;
const express_1 = __importDefault(require("express"));
const modular_api_1 = __importDefault(require("./functions/modular-api"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const cms_integration_1 = require("./cms-integration");
exports.PORT = parseInt(process.env.PORT || '7474', 10);
// Create and configure the Express app
function createModularApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    // Use the modular API router
    app.use('/api/modular', modular_api_1.default);
    app.use('/api', userRoutes_1.default);
    // Root endpoint
    app.get('/', (req, res) => {
        res.json({
            message: 'ModulaR API Server',
            version: '1.0.0',
            description: 'API package for connecting Node.js apps as modules to ModulaR CMS',
            documentation: 'See README.md for complete API documentation',
            endpoints: {
                modular: '/api/modular',
                users: '/api/users',
                health: '/api/health'
            },
            modularEndpoints: {
                register: 'POST /api/modular/register',
                modules: 'GET /api/modular/modules',
                moduleById: 'GET /api/modular/modules/:moduleId',
                unregister: 'DELETE /api/modular/modules/:moduleId',
                heartbeat: 'POST /api/modular/heartbeat/:moduleId',
                communicate: 'POST /api/modular/communicate/:moduleId',
                broadcast: 'POST /api/modular/broadcast',
                health: 'GET /api/modular/health',
                logs: 'GET /api/modular/logs',
                capabilities: 'GET /api/modular/modules/:moduleId/capabilities'
            }
        });
    });
    return app;
}
// Start the server (for CMS integration)
function startModularServer(port = exports.PORT) {
    return new Promise((resolve, reject) => {
        const app = createModularApp();
        const server = app.listen(port, () => {
            console.log(`🚀 ModulaR API Server is listening on port ${port}`);
            console.log(`📋 API Documentation: http://localhost:${port}/`);
            console.log(`🔗 Modular endpoints available at: http://localhost:${port}/api/modular`);
            console.log(`📊 Health check: http://localhost:${port}/api/modular/health`);
            resolve(server);
        });
        server.on('error', (error) => {
            reject(error);
        });
    });
}
// Export the configured app instance for direct use
exports.app = createModularApp();
// Export all important components for use as a package
__exportStar(require("./types/modular"), exports);
var modularService_1 = require("./services/modularService");
Object.defineProperty(exports, "modularService", { enumerable: true, get: function () { return modularService_1.modularService; } });
var modularClient_1 = require("./services/modularClient");
Object.defineProperty(exports, "createModularClient", { enumerable: true, get: function () { return modularClient_1.createModularClient; } });
Object.defineProperty(exports, "createExampleModuleConfig", { enumerable: true, get: function () { return modularClient_1.createExampleModuleConfig; } });
Object.defineProperty(exports, "ModularClient", { enumerable: true, get: function () { return modularClient_1.ModularClient; } });
var modular_api_2 = require("./functions/modular-api");
Object.defineProperty(exports, "modularApiRouter", { enumerable: true, get: function () { return __importDefault(modular_api_2).default; } });
var cms_integration_2 = require("./cms-integration");
Object.defineProperty(exports, "ModularCMS", { enumerable: true, get: function () { return cms_integration_2.ModularCMS; } });
Object.defineProperty(exports, "modularCMS", { enumerable: true, get: function () { return cms_integration_2.modularCMS; } });
// Default export for CMS integration
exports.default = {
    createApp: createModularApp,
    startServer: startModularServer,
    app: exports.app,
    PORT: exports.PORT,
    ModularCMS: cms_integration_1.ModularCMS,
    cms: cms_integration_1.modularCMS
};
