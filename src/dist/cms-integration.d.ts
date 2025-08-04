import { Application } from 'express';
import { ModuleConfig, ModularApiResponse, ModuleHealth } from './types/modular';
/**
 * ModulaR CMS Integration Helper
 * This class provides easy integration of ModulaR API into a CMS
 */
export declare class ModularCMS {
    private app;
    private server;
    private isRunning;
    constructor();
    /**
     * Initialize ModulaR API as part of an existing Express app
     */
    integrateWithApp(existingApp: Application, basePath?: string): void;
    /**
     * Start ModulaR API as a standalone service
     */
    startStandaloneServer(port?: number): Promise<void>;
    /**
     * Stop the ModulaR API server
     */
    stopServer(): Promise<void>;
    /**
     * Get all registered modules
     */
    getRegisteredModules(): ModuleConfig[];
    /**
     * Get a specific module by ID
     */
    getModule(moduleId: string): ModuleConfig | undefined;
    /**
     * Get health status of all modules
     */
    getModuleHealthStatus(): ModuleHealth[];
    /**
     * Send a command to a specific module
     */
    sendCommandToModule(moduleId: string, action: string, data?: any): Promise<ModularApiResponse>;
    /**
     * Broadcast a message to all registered modules
     */
    broadcastToAllModules(action: string, data?: any): Promise<ModularApiResponse>;
    /**
     * Register an event handler for module lifecycle events
     */
    onModuleEvent(event: string, handler: (data: any) => void): void;
    /**
     * Remove an event handler
     */
    offModuleEvent(event: string, handler: (data: any) => void): void;
    /**
     * Get communication logs
     */
    getCommunicationLogs(limit?: number): import("./index").CommunicationEvent[];
    /**
     * Check if the server is running
     */
    isServerRunning(): boolean;
    /**
     * Get server statistics
     */
    getServerStats(): {
        totalModules: number;
        activeModules: number;
        inactiveModules: number;
        errorModules: number;
        isServerRunning: boolean;
        uptime: number;
    };
    private setupEventListeners;
}
export declare const modularCMS: ModularCMS;
//# sourceMappingURL=cms-integration.d.ts.map