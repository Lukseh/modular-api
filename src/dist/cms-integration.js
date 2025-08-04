"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modularCMS = exports.ModularCMS = void 0;
const index_1 = require("./index");
const modularService_1 = require("./services/modularService");
/**
 * ModulaR CMS Integration Helper
 * This class provides easy integration of ModulaR API into a CMS
 */
class ModularCMS {
    constructor() {
        this.app = null;
        this.server = null;
        this.isRunning = false;
        // Set up event listeners for module lifecycle events
        this.setupEventListeners();
    }
    /**
     * Initialize ModulaR API as part of an existing Express app
     */
    integrateWithApp(existingApp, basePath = '/api/modular') {
        const modularApp = (0, index_1.createModularApp)();
        // Mount the modular routes on the existing app
        existingApp.use(basePath, modularApp);
        console.log(`🔗 ModulaR API integrated at ${basePath}`);
    }
    /**
     * Start ModulaR API as a standalone service
     */
    async startStandaloneServer(port) {
        if (this.isRunning) {
            throw new Error('ModulaR API server is already running');
        }
        try {
            this.server = await (0, index_1.startModularServer)(port);
            this.isRunning = true;
            console.log('✅ ModulaR API server started successfully');
        }
        catch (error) {
            console.error('❌ Failed to start ModulaR API server:', error);
            throw error;
        }
    }
    /**
     * Stop the ModulaR API server
     */
    async stopServer() {
        if (!this.server || !this.isRunning) {
            return;
        }
        return new Promise((resolve) => {
            this.server.close(() => {
                this.isRunning = false;
                console.log('🛑 ModulaR API server stopped');
                resolve();
            });
        });
    }
    /**
     * Get all registered modules
     */
    getRegisteredModules() {
        return modularService_1.modularService.getRegisteredModules();
    }
    /**
     * Get a specific module by ID
     */
    getModule(moduleId) {
        return modularService_1.modularService.getModule(moduleId);
    }
    /**
     * Get health status of all modules
     */
    getModuleHealthStatus() {
        return modularService_1.modularService.getAllModuleHealth();
    }
    /**
     * Send a command to a specific module
     */
    async sendCommandToModule(moduleId, action, data) {
        return modularService_1.modularService.sendCommunication(moduleId, action, data);
    }
    /**
     * Broadcast a message to all registered modules
     */
    async broadcastToAllModules(action, data) {
        return modularService_1.modularService.broadcastToModules(action, data);
    }
    /**
     * Register an event handler for module lifecycle events
     */
    onModuleEvent(event, handler) {
        modularService_1.modularService.on(event, handler);
    }
    /**
     * Remove an event handler
     */
    offModuleEvent(event, handler) {
        modularService_1.modularService.off(event, handler);
    }
    /**
     * Get communication logs
     */
    getCommunicationLogs(limit) {
        return modularService_1.modularService.getCommunicationLog(limit);
    }
    /**
     * Check if the server is running
     */
    isServerRunning() {
        return this.isRunning;
    }
    /**
     * Get server statistics
     */
    getServerStats() {
        const modules = this.getRegisteredModules();
        const healthStatuses = this.getModuleHealthStatus();
        return {
            totalModules: modules.length,
            activeModules: healthStatuses.filter(h => h.status === 'active').length,
            inactiveModules: healthStatuses.filter(h => h.status === 'inactive').length,
            errorModules: healthStatuses.filter(h => h.status === 'error').length,
            isServerRunning: this.isRunning,
            uptime: this.isRunning ? process.uptime() : 0
        };
    }
    setupEventListeners() {
        // Listen for module registration events
        modularService_1.modularService.on('module.registered', (eventData) => {
            console.log(`📝 Module registered: ${eventData.moduleId}`);
        });
        // Listen for module unregistration events
        modularService_1.modularService.on('module.unregistered', (eventData) => {
            console.log(`🗑️ Module unregistered: ${eventData.moduleId}`);
        });
        // Listen for module errors
        modularService_1.modularService.on('module.error', (eventData) => {
            console.warn(`⚠️ Module error: ${eventData.moduleId} - ${eventData.error}`);
        });
        // Listen for module heartbeats
        modularService_1.modularService.on('module.heartbeat', (eventData) => {
            // Optionally log heartbeats (commented out to avoid spam)
            // console.log(`💓 Heartbeat from: ${eventData.moduleId}`);
        });
    }
}
exports.ModularCMS = ModularCMS;
// Export a singleton instance for easy use
exports.modularCMS = new ModularCMS();
//# sourceMappingURL=cms-integration.js.map