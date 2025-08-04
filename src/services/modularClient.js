"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModularClient = void 0;
exports.createModularClient = createModularClient;
exports.createExampleModuleConfig = createExampleModuleConfig;
const events_1 = require("events");
class ModularClient extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.heartbeatTimer = null;
        this.isRegistered = false;
        this.apiUrl = options.apiUrl;
        this.moduleConfig = options.moduleConfig;
        this.heartbeatInterval = options.heartbeatInterval || 30000;
        this.retryAttempts = options.retryAttempts || 3;
        this.retryDelay = options.retryDelay || 1000;
        this.startTime = Date.now();
    }
    // HTTP request helper using built-in modules
    async makeRequest(method, path, data) {
        // This is a simplified HTTP client
        // In a real implementation, you would use a proper HTTP library
        const url = `${this.apiUrl}${path}`;
        return new Promise((resolve, reject) => {
            const https = require('https');
            const http = require('http');
            const urlLib = require('url');
            const parsedUrl = urlLib.parse(url);
            const isHttps = parsedUrl.protocol === 'https:';
            const client = isHttps ? https : http;
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (isHttps ? 443 : 80),
                path: parsedUrl.path,
                method: method.toUpperCase(),
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': `ModularClient/${this.moduleConfig.version}`
                }
            };
            const req = client.request(options, (res) => {
                let responseData = '';
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(responseData);
                        resolve({ data: parsed, status: res.statusCode });
                    }
                    catch (error) {
                        reject(new Error('Invalid JSON response'));
                    }
                });
            });
            req.on('error', (error) => {
                reject(error);
            });
            if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                req.write(JSON.stringify(data));
            }
            req.end();
        });
    }
    // Register this module with the ModulaR API
    async register() {
        try {
            const response = await this.retryRequest(async () => {
                return await this.makeRequest('POST', '/register', this.moduleConfig);
            });
            if (response.data.success) {
                this.isRegistered = true;
                this.startHeartbeat();
                this.emit('registered', response.data);
            }
            return response.data;
        }
        catch (error) {
            this.emit('registrationFailed', error);
            throw error;
        }
    }
    // Unregister this module
    async unregister() {
        try {
            this.stopHeartbeat();
            const response = await this.makeRequest('DELETE', `/modules/${this.moduleConfig.moduleId}`);
            if (response.data.success) {
                this.isRegistered = false;
                this.emit('unregistered', response.data);
            }
            return response.data;
        }
        catch (error) {
            this.emit('unregistrationFailed', error);
            throw error;
        }
    }
    // Send heartbeat with health data
    async sendHeartbeat(customHealthData) {
        if (!this.isRegistered) {
            throw new Error('Module not registered');
        }
        try {
            const healthData = {
                ...customHealthData,
                uptime: Math.floor((Date.now() - this.startTime) / 1000),
                memory: this.getMemoryUsage(),
                cpu: this.getCpuUsage()
            };
            const response = await this.makeRequest('POST', `/heartbeat/${this.moduleConfig.moduleId}`, healthData);
            this.emit('heartbeatSent', response.data);
            return response.data;
        }
        catch (error) {
            this.emit('heartbeatFailed', error);
            throw error;
        }
    }
    // Listen for communications from ModulaR CMS
    async pollForCommunications() {
        // This would typically use WebSockets or Server-Sent Events
        // For now, we'll provide a method that can be called periodically
        try {
            // In a real implementation, this would poll for pending communications
            this.emit('communicationReceived', {
                action: 'poll',
                data: null,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.emit('communicationError', error);
        }
    }
    // Send data back to ModulaR CMS
    async sendDataToCMS(action, data) {
        try {
            // This would send data back to the CMS
            // Implementation depends on the specific communication pattern
            const payload = {
                moduleId: this.moduleConfig.moduleId,
                action,
                data,
                timestamp: new Date().toISOString()
            };
            this.emit('dataSentToCMS', payload);
            return {
                success: true,
                data: { message: 'Data sent to CMS' },
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            this.emit('dataSendFailed', error);
            throw error;
        }
    }
    // Get module information from API
    async getModuleInfo() {
        try {
            const response = await this.makeRequest('GET', `/modules/${this.moduleConfig.moduleId}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }
    // Get all registered modules
    async getAllModules() {
        try {
            const response = await this.makeRequest('GET', '/modules');
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }
    // Get health status of all modules
    async getSystemHealth() {
        try {
            const response = await this.makeRequest('GET', '/health');
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }
    // Update module configuration
    updateConfig(newConfig) {
        this.moduleConfig = { ...this.moduleConfig, ...newConfig };
        this.emit('configUpdated', this.moduleConfig);
    }
    // Get current module configuration
    getConfig() {
        return { ...this.moduleConfig };
    }
    // Check if module is registered
    isModuleRegistered() {
        return this.isRegistered;
    }
    // Graceful shutdown
    async shutdown() {
        try {
            if (this.isRegistered) {
                await this.unregister();
            }
            this.stopHeartbeat();
            this.removeAllListeners();
            this.emit('shutdown');
        }
        catch (error) {
            this.emit('shutdownError', error);
        }
    }
    // Private methods
    startHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
        }
        this.heartbeatTimer = setInterval(async () => {
            try {
                await this.sendHeartbeat();
            }
            catch (error) {
                this.emit('heartbeatError', error);
            }
        }, this.heartbeatInterval);
    }
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
    async retryRequest(requestFn) {
        let lastError;
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                return await requestFn();
            }
            catch (error) {
                lastError = error;
                if (attempt < this.retryAttempts) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }
        throw lastError;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    getMemoryUsage() {
        if (typeof process !== 'undefined' && process.memoryUsage) {
            const usage = process.memoryUsage();
            return {
                used: usage.heapUsed,
                total: usage.heapTotal,
                percentage: Math.round((usage.heapUsed / usage.heapTotal) * 100)
            };
        }
        return null;
    }
    getCpuUsage() {
        // This is a simplified CPU usage calculation
        // In a real implementation, you might use a library like 'pidusage'
        if (typeof process !== 'undefined' && process.cpuUsage) {
            const usage = process.cpuUsage();
            return {
                percentage: 0, // Would need more complex calculation
                load: [] // Simplified for compatibility
            };
        }
        return null;
    }
}
exports.ModularClient = ModularClient;
// Helper function to create a client instance
function createModularClient(options) {
    return new ModularClient(options);
}
// Example usage helper
function createExampleModuleConfig(moduleId, moduleName) {
    return {
        moduleId,
        moduleName,
        version: '1.0.0',
        description: `Example module: ${moduleName}`,
        capabilities: [
            {
                name: 'basic-operations',
                description: 'Basic CRUD operations',
                version: '1.0.0'
            }
        ],
        endpoints: [
            {
                path: '/status',
                method: 'GET',
                description: 'Get module status',
                protected: false
            },
            {
                path: '/data',
                method: 'GET',
                description: 'Get module data',
                protected: true
            }
        ],
        metadata: {
            author: 'ModulaR Team',
            license: 'MIT',
            createdAt: new Date().toISOString()
        }
    };
}
