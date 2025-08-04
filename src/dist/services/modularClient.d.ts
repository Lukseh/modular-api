import { EventEmitter } from 'events';
import { ModuleConfig, ModularApiResponse, ModuleHealth } from '../types/modular';
export interface ModularClientOptions {
    apiUrl: string;
    moduleConfig: ModuleConfig;
    heartbeatInterval?: number;
    retryAttempts?: number;
    retryDelay?: number;
}
export declare class ModularClient extends EventEmitter {
    private apiUrl;
    private moduleConfig;
    private heartbeatInterval;
    private retryAttempts;
    private retryDelay;
    private heartbeatTimer;
    private isRegistered;
    private startTime;
    constructor(options: ModularClientOptions);
    private makeRequest;
    register(): Promise<ModularApiResponse>;
    unregister(): Promise<ModularApiResponse>;
    sendHeartbeat(customHealthData?: Partial<ModuleHealth>): Promise<ModularApiResponse>;
    pollForCommunications(): Promise<void>;
    sendDataToCMS(action: string, data: any): Promise<ModularApiResponse>;
    getModuleInfo(): Promise<ModularApiResponse>;
    getAllModules(): Promise<ModularApiResponse>;
    getSystemHealth(): Promise<ModularApiResponse>;
    updateConfig(newConfig: Partial<ModuleConfig>): void;
    getConfig(): ModuleConfig;
    isModuleRegistered(): boolean;
    shutdown(): Promise<void>;
    private startHeartbeat;
    private stopHeartbeat;
    private retryRequest;
    private delay;
    private getMemoryUsage;
    private getCpuUsage;
}
export declare function createModularClient(options: ModularClientOptions): ModularClient;
export declare function createExampleModuleConfig(moduleId: string, moduleName: string): ModuleConfig;
//# sourceMappingURL=modularClient.d.ts.map