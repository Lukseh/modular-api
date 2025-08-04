import { EventEmitter } from 'events';
import { 
    ModuleConfig, 
    ModuleHealth, 
    ModularApiResponse, 
    CommunicationEvent,
    ModuleLifecycleEvent,
    ModuleEventData 
} from '../types/modular';

export class ModularService extends EventEmitter {
    private registeredModules = new Map<string, ModuleConfig>();
    private moduleHealthStatus = new Map<string, ModuleHealth>();
    private communicationLog: CommunicationEvent[] = [];
    private heartbeatInterval: NodeJS.Timeout | null = null;

    constructor() {
        super();
        this.startHealthMonitoring();
    }

    // Register a new module
    async registerModule(moduleConfig: ModuleConfig): Promise<ModularApiResponse> {
        try {
            // Validate module configuration
            const validation = this.validateModuleConfig(moduleConfig);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.error,
                    timestamp: new Date().toISOString()
                };
            }

            // Check for conflicts
            if (this.registeredModules.has(moduleConfig.moduleId)) {
                return {
                    success: false,
                    error: `Module with ID ${moduleConfig.moduleId} is already registered`,
                    timestamp: new Date().toISOString()
                };
            }

            // Register the module
            this.registeredModules.set(moduleConfig.moduleId, moduleConfig);
            
            // Initialize health status
            this.moduleHealthStatus.set(moduleConfig.moduleId, {
                moduleId: moduleConfig.moduleId,
                status: 'active',
                lastHeartbeat: new Date().toISOString(),
                uptime: 0
            });

            // Emit registration event
            this.emitModuleEvent('module.registered', moduleConfig.moduleId, { moduleConfig });

            // Log communication
            this.logCommunication({
                type: 'register',
                source: 'modular-api',
                target: moduleConfig.moduleId,
                data: { moduleName: moduleConfig.moduleName },
                timestamp: new Date().toISOString(),
                priority: 'normal'
            });

            return {
                success: true,
                data: {
                    message: `Module ${moduleConfig.moduleName} registered successfully`,
                    moduleId: moduleConfig.moduleId,
                    registeredEndpoints: moduleConfig.endpoints.length
                },
                moduleId: moduleConfig.moduleId,
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            return {
                success: false,
                error: `Registration failed: ${error?.message || 'Unknown error'}`,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Unregister a module
    async unregisterModule(moduleId: string): Promise<ModularApiResponse> {
        try {
            if (!this.registeredModules.has(moduleId)) {
                return {
                    success: false,
                    error: 'Module not found',
                    timestamp: new Date().toISOString()
                };
            }

            const moduleConfig = this.registeredModules.get(moduleId);
            this.registeredModules.delete(moduleId);
            this.moduleHealthStatus.delete(moduleId);

            // Emit unregistration event
            this.emitModuleEvent('module.unregistered', moduleId, { moduleConfig });

            // Log communication
            this.logCommunication({
                type: 'unregister',
                source: 'modular-api',
                target: moduleId,
                data: { moduleName: moduleConfig?.moduleName },
                timestamp: new Date().toISOString(),
                priority: 'normal'
            });

            return {
                success: true,
                data: { message: 'Module unregistered successfully' },
                moduleId,
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            return {
                success: false,
                error: `Unregistration failed: ${error?.message || 'Unknown error'}`,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Update module heartbeat
    async updateHeartbeat(moduleId: string, healthData?: Partial<ModuleHealth>): Promise<ModularApiResponse> {
        try {
            if (!this.registeredModules.has(moduleId)) {
                return {
                    success: false,
                    error: 'Module not registered',
                    timestamp: new Date().toISOString()
                };
            }

            const currentHealth = this.moduleHealthStatus.get(moduleId);
            if (currentHealth) {
                this.moduleHealthStatus.set(moduleId, {
                    ...currentHealth,
                    ...healthData,
                    status: 'active',
                    lastHeartbeat: new Date().toISOString(),
                    uptime: currentHealth.uptime + 1
                });

                // Emit heartbeat event
                this.emitModuleEvent('module.heartbeat', moduleId, { health: currentHealth });
            }

            return {
                success: true,
                data: { message: 'Heartbeat received' },
                moduleId,
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            return {
                success: false,
                error: `Heartbeat update failed: ${error?.message || 'Unknown error'}`,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Get all registered modules
    getRegisteredModules(): ModuleConfig[] {
        return Array.from(this.registeredModules.values());
    }

    // Get specific module
    getModule(moduleId: string): ModuleConfig | undefined {
        return this.registeredModules.get(moduleId);
    }

    // Get module health status
    getModuleHealth(moduleId: string): ModuleHealth | undefined {
        return this.moduleHealthStatus.get(moduleId);
    }

    // Get all module health statuses
    getAllModuleHealth(): ModuleHealth[] {
        return Array.from(this.moduleHealthStatus.values());
    }

    // Send communication to module
    async sendCommunication(moduleId: string, action: string, data: any): Promise<ModularApiResponse> {
        try {
            if (!this.registeredModules.has(moduleId)) {
                return {
                    success: false,
                    error: 'Module not found',
                    timestamp: new Date().toISOString()
                };
            }

            // Log communication
            this.logCommunication({
                type: 'request',
                source: 'modular-api',
                target: moduleId,
                data: { action, payload: data },
                timestamp: new Date().toISOString(),
                priority: 'normal'
            });

            // In a real implementation, this would forward to the actual module
            // For now, we simulate the communication
            return {
                success: true,
                data: {
                    message: `Communication sent to module ${moduleId}`,
                    action,
                    requestData: data
                },
                moduleId,
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            return {
                success: false,
                error: `Communication failed: ${error?.message || 'Unknown error'}`,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Broadcast message to all modules
    async broadcastToModules(action: string, data: any): Promise<ModularApiResponse> {
        try {
            const moduleIds = Array.from(this.registeredModules.keys());
            
            // Log broadcast
            this.logCommunication({
                type: 'broadcast',
                source: 'modular-api',
                data: { action, payload: data, targetCount: moduleIds.length },
                timestamp: new Date().toISOString(),
                priority: 'normal'
            });

            return {
                success: true,
                data: {
                    message: `Broadcast sent to ${moduleIds.length} modules`,
                    action,
                    targetModules: moduleIds.length
                },
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            return {
                success: false,
                error: `Broadcast failed: ${error?.message || 'Unknown error'}`,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Get communication log
    getCommunicationLog(limit?: number): CommunicationEvent[] {
        if (limit) {
            return this.communicationLog.slice(-limit);
        }
        return this.communicationLog;
    }

    // Private methods
    private validateModuleConfig(config: ModuleConfig): { isValid: boolean; error?: string } {
        if (!config.moduleId || !config.moduleName) {
            return { isValid: false, error: 'Module ID and name are required' };
        }

        if (!config.version) {
            return { isValid: false, error: 'Module version is required' };
        }

        if (!Array.isArray(config.endpoints)) {
            return { isValid: false, error: 'Module endpoints must be an array' };
        }

        if (!Array.isArray(config.capabilities)) {
            return { isValid: false, error: 'Module capabilities must be an array' };
        }

        return { isValid: true };
    }

    private emitModuleEvent(event: ModuleLifecycleEvent, moduleId: string, data?: any): void {
        const eventData: ModuleEventData = {
            moduleId,
            event,
            timestamp: new Date().toISOString(),
            data
        };

        this.emit('moduleEvent', eventData);
        this.emit(event, eventData);
    }

    private logCommunication(event: CommunicationEvent): void {
        this.communicationLog.push(event);
        
        // Keep only last 1000 entries
        if (this.communicationLog.length > 1000) {
            this.communicationLog = this.communicationLog.slice(-1000);
        }
    }

    private startHealthMonitoring(): void {
        // Check module health every 30 seconds
        this.heartbeatInterval = setInterval(() => {
            this.checkModuleHealth();
        }, 30000);
    }

    private checkModuleHealth(): void {
        const now = new Date();
        const timeoutThreshold = 2 * 60 * 1000; // 2 minutes

        for (const [moduleId, health] of this.moduleHealthStatus) {
            const lastHeartbeat = new Date(health.lastHeartbeat);
            const timeSinceHeartbeat = now.getTime() - lastHeartbeat.getTime();

            if (timeSinceHeartbeat > timeoutThreshold && health.status === 'active') {
                // Mark module as inactive
                health.status = 'inactive';
                this.emitModuleEvent('module.error', moduleId, { 
                    error: 'Module heartbeat timeout',
                    lastHeartbeat: health.lastHeartbeat
                });
            }
        }
    }

    // Cleanup
    destroy(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        this.removeAllListeners();
    }
}

// Singleton instance
export const modularService = new ModularService();
