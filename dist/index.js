//Includes
import { Elysia, t } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { ModulaR } from './model';
import { modularService } from './service';
// Variables
const PORT = process.env.PORT || 3000;
const VERSION = '1.1.0';
// ========================================
// UNIFIED MODULAR API PACKAGE
// This package can be imported by both CMS and Modules
// ========================================
// For CMS: Complete API server and management functions
export var CMS;
(function (CMS) {
    // Create and configure the Elysia API server for CMS
    function createAPIServer(config) {
        const port = config?.port || PORT;
        const prefix = config?.prefix || '/api';
        const app = new Elysia({
            prefix,
            normalize: true
        })
            .use(swagger({
            documentation: {
                info: {
                    title: 'ModulaR CMS API',
                    version: VERSION,
                    description: 'API for apps to register as modules with ModulaR CMS'
                },
                tags: [
                    {
                        name: 'v1',
                        description: 'Version 1 API endpoints - Current stable version'
                    },
                    {
                        name: 'v2',
                        description: 'Version 2 API endpoints - Future version (placeholder)'
                    },
                    {
                        name: 'System',
                        description: 'System-wide endpoints and information'
                    }
                ]
            }
        }))
            .get('/', () => ({
            message: 'ModulaR CMS API Server',
            version: VERSION,
            description: 'API for apps to register as modules with ModulaR CMS',
            documentation: `${prefix}/swagger`,
            versions: {
                v1: 'Current stable version',
                v2: 'Future version (planned)'
            },
            endpoints: {
                v1: `${prefix}/v1`,
                v2: `${prefix}/v2`,
                health: `${prefix}/v1/health`,
                register: `${prefix}/v1/register`
            }
        }), {
            tags: ['System'],
            summary: 'API Information',
            description: 'Get basic information about the ModulaR API server and available versions'
        })
            // V1 API Group - Current stable version
            .group('/v1', (app) => app
            .get('/health', () => modularService.getSystemHealth(), {
            tags: ['v1'],
            summary: 'System Health Check',
            description: 'Check the health status of the ModulaR API server and get module statistics'
        })
            .post('/register', async ({ body, set }) => {
            try {
                return await modularService.registerModule(body);
            }
            catch (error) {
                set.status = 400;
                return { success: false, error: error.message };
            }
        }, {
            tags: ['v1'],
            summary: 'Register Module',
            description: 'Register a new module with the CMS. Apps call this endpoint to announce their availability and capabilities.',
            body: ModulaR.ModuleConfig
        })
            .get('/modules', () => ({
            modules: modularService.getModules(),
            total: modularService.getModules().length,
            timestamp: new Date().toISOString()
        }), {
            tags: ['v1'],
            summary: 'List All Modules',
            description: 'Get a list of all registered modules'
        })
            .get('/modules/:moduleId', ({ params, set }) => {
            const module = modularService.getModule(params.moduleId);
            if (!module) {
                set.status = 404;
                return { error: 'Module not found' };
            }
            return module;
        }, {
            tags: ['v1'],
            summary: 'Get Module Details',
            description: 'Get detailed information about a specific module',
            params: t.Object({
                moduleId: t.String()
            })
        })
            .delete('/modules/:moduleId', async ({ params, set }) => {
            try {
                return await modularService.unregisterModule(params.moduleId);
            }
            catch (error) {
                set.status = 404;
                return { success: false, error: error.message };
            }
        }, {
            tags: ['v1'],
            summary: 'Unregister Module',
            description: 'Remove a module from the CMS',
            params: t.Object({
                moduleId: t.String()
            })
        })
            .post('/heartbeat/:moduleId', async ({ params, body, set }) => {
            try {
                return await modularService.processHeartbeat(params.moduleId, body);
            }
            catch (error) {
                set.status = 404;
                return { success: false, error: error.message };
            }
        }, {
            tags: ['v1'],
            summary: 'Send Heartbeat',
            description: 'Send a heartbeat signal to indicate the module is still alive',
            params: t.Object({
                moduleId: t.String()
            }),
            body: t.Optional(ModulaR.HeartbeatPayload)
        })
            .post('/communicate/:moduleId', async ({ params, body, set }) => {
            try {
                const { action, data } = body;
                return await modularService.sendCommunication(params.moduleId, action, data);
            }
            catch (error) {
                set.status = 404;
                return { success: false, error: error.message };
            }
        }, {
            tags: ['v1'],
            summary: 'Send Communication',
            description: 'Send a message/command to a specific module',
            params: t.Object({
                moduleId: t.String()
            }),
            body: t.Object({
                action: t.String(),
                data: t.Any()
            })
        })
            .post('/broadcast', async ({ body }) => {
            const { action, data } = body;
            return await modularService.broadcastCommunication(action, data);
        }, {
            tags: ['v1'],
            summary: 'Broadcast Message',
            description: 'Send a message to all registered modules',
            body: t.Object({
                action: t.String(),
                data: t.Any()
            })
        })
            .get('/logs', ({ query }) => {
            const limit = query.limit ? parseInt(query.limit) : 100;
            return { logs: modularService.getCommunicationLogs(limit) };
        }, {
            tags: ['v1'],
            summary: 'Get Communication Logs',
            description: 'Get recent communication logs between the CMS and modules',
            query: t.Optional(t.Object({
                limit: t.Optional(t.String())
            }))
        }))
            // V2 API Group - Future version (placeholder for backward compatibility)
            .group('/v2', (app) => app
            .get('/status', () => ({
            version: '2.0.0',
            status: 'planned',
            message: 'API v2 is currently in development',
            availableIn: 'Future releases',
            backwardCompatibility: 'v1 will remain supported'
        }), {
            tags: ['v2'],
            summary: 'V2 Status',
            description: 'Get information about API v2 development status'
        })
            // Placeholder endpoints for future v2 features
            .get('/health', () => ({
            ...modularService.getSystemHealth(),
            version: '2.0.0',
            features: ['databases(sql and no-sql)', 'graphql', 'RobusT security', 'caching Redis', 'HAproxy support', 'production safety']
        }), {
            tags: ['v2'],
            summary: 'Enhanced Health Check (v2)',
            description: 'Enhanced health check with additional features (future version)'
        }))
            .listen(port);
        return app;
    }
    CMS.createAPIServer = createAPIServer;
    // CMS Management Functions
    function getRegisteredModules() {
        return modularService.getModules();
    }
    CMS.getRegisteredModules = getRegisteredModules;
    function getModule(moduleId) {
        return modularService.getModule(moduleId);
    }
    CMS.getModule = getModule;
    function getSystemHealth() {
        return modularService.getSystemHealth();
    }
    CMS.getSystemHealth = getSystemHealth;
    function getModuleHealth() {
        return modularService.getModuleHealth();
    }
    CMS.getModuleHealth = getModuleHealth;
    async function sendCommandToModule(moduleId, action, data) {
        return await modularService.sendCommunication(moduleId, action, data);
    }
    CMS.sendCommandToModule = sendCommandToModule;
    async function broadcastToAllModules(action, data) {
        return await modularService.broadcastCommunication(action, data);
    }
    CMS.broadcastToAllModules = broadcastToAllModules;
    function getCommunicationLogs(limit) {
        return modularService.getCommunicationLogs(limit);
    }
    CMS.getCommunicationLogs = getCommunicationLogs;
    function onModuleEvent(event, handler) {
        // Event system implementation would go here
        console.log(`Event handler registered for: ${event}`);
    }
    CMS.onModuleEvent = onModuleEvent;
})(CMS || (CMS = {}));
// For Modules: Simple registration and communication functions
export var Module;
(function (Module) {
    // Create a client for modules to register with CMS
    function createClient(options) {
        let heartbeatInterval;
        const apiVersion = options.apiVersion || 'v1'; // Default to v1 for backward compatibility
        return {
            async register() {
                try {
                    console.log(`📝 Registering module: ${options.moduleConfig.moduleId} (API ${apiVersion})`);
                    // In real implementation, make HTTP request to CMS API
                    const response = await fetch(`${options.apiUrl}/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(options.moduleConfig)
                    });
                    const result = await response.json();
                    if (result.success) {
                        // Start heartbeat if registration successful
                        this.startHeartbeat();
                    }
                    return result;
                }
                catch (error) {
                    console.error('Registration failed:', error.message);
                    return { success: false, error: error.message };
                }
            },
            startHeartbeat() {
                if (heartbeatInterval)
                    return;
                heartbeatInterval = setInterval(async () => {
                    try {
                        await fetch(`${options.apiUrl}/heartbeat/${options.moduleConfig.moduleId}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                status: 'active',
                                timestamp: new Date().toISOString(),
                                apiVersion
                            })
                        });
                        console.log(`💓 Heartbeat sent: ${options.moduleConfig.moduleId} (${apiVersion})`);
                    }
                    catch (error) {
                        console.error('Heartbeat failed:', error);
                    }
                }, options.heartbeatInterval || 30000);
            },
            stopHeartbeat() {
                if (heartbeatInterval) {
                    clearInterval(heartbeatInterval);
                    heartbeatInterval = null;
                }
            },
            async unregister() {
                try {
                    this.stopHeartbeat();
                    await fetch(`${options.apiUrl}/modules/${options.moduleConfig.moduleId}`, {
                        method: 'DELETE'
                    });
                    console.log(`🔌 Module unregistered: ${options.moduleConfig.moduleId}`);
                    return { success: true };
                }
                catch (error) {
                    console.error('Unregistration failed:', error);
                    return { success: false };
                }
            },
            // Simple route registration helpers for modules
            routes: {
                get(path, handler) {
                    console.log(`📋 Module route registered: GET ${path} (${apiVersion})`);
                    // This would be part of the module's endpoint config
                },
                post(path, handler) {
                    console.log(`📋 Module route registered: POST ${path} (${apiVersion})`);
                },
                put(path, handler) {
                    console.log(`📋 Module route registered: PUT ${path} (${apiVersion})`);
                },
                delete(path, handler) {
                    console.log(`📋 Module route registered: DELETE ${path} (${apiVersion})`);
                }
            },
            // Get API version being used
            getApiVersion() {
                return apiVersion;
            }
        };
    }
    Module.createClient = createClient;
    // Helper to create module config
    function createConfig(config) {
        return {
            capabilities: [],
            endpoints: [],
            ...config
        };
    }
    Module.createConfig = createConfig;
})(Module || (Module = {}));
// Auto-start server if this is the main module (for CMS usage)
let app = null;
if (typeof require !== 'undefined' && require.main === module) {
    app = CMS.createAPIServer();
    console.log(`🦊 ModulaR CMS API Server running at http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api/swagger`);
    console.log(`🔗 V1 Register endpoint: http://localhost:${PORT}/api/v1/register`);
    console.log(`🔮 V2 Status endpoint: http://localhost:${PORT}/api/v2/status`);
}
// Export the app instance for CMS integration
export { app };
//# sourceMappingURL=index.js.map