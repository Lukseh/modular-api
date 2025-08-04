import { EventEmitter } from 'events';
import { ModuleConfig, ModuleHealth, ModularApiResponse, CommunicationEvent } from '../types/modular';
export declare class ModularService extends EventEmitter {
    private registeredModules;
    private moduleHealthStatus;
    private communicationLog;
    private heartbeatInterval;
    constructor();
    registerModule(moduleConfig: ModuleConfig): Promise<ModularApiResponse>;
    unregisterModule(moduleId: string): Promise<ModularApiResponse>;
    updateHeartbeat(moduleId: string, healthData?: Partial<ModuleHealth>): Promise<ModularApiResponse>;
    getRegisteredModules(): ModuleConfig[];
    getModule(moduleId: string): ModuleConfig | undefined;
    getModuleHealth(moduleId: string): ModuleHealth | undefined;
    getAllModuleHealth(): ModuleHealth[];
    sendCommunication(moduleId: string, action: string, data: any): Promise<ModularApiResponse>;
    broadcastToModules(action: string, data: any): Promise<ModularApiResponse>;
    getCommunicationLog(limit?: number): CommunicationEvent[];
    private validateModuleConfig;
    private emitModuleEvent;
    private logCommunication;
    private startHealthMonitoring;
    private checkModuleHealth;
    destroy(): void;
}
export declare const modularService: ModularService;
//# sourceMappingURL=modularService.d.ts.map