// Core types for ModulaR API communication

export interface ModuleConfig {
    moduleId: string;
    moduleName: string;
    version: string;
    description?: string;
    author?: string;
    license?: string;
    capabilities: ModuleCapability[];
    dependencies?: ModuleDependency[];
    endpoints: ModuleEndpoint[];
    metadata?: Record<string, any>;
}

export interface ModuleCapability {
    name: string;
    description?: string;
    version?: string;
    config?: Record<string, any>;
}

export interface ModuleDependency {
    name: string;
    version: string;
    required: boolean;
}

export interface ModuleEndpoint {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    description?: string;
    protected?: boolean;
    params?: EndpointParam[];
    response?: EndpointResponse;
}

export interface EndpointParam {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required: boolean;
    description?: string;
    default?: any;
}

export interface EndpointResponse {
    type: string;
    description?: string;
    example?: any;
}

export interface ModularApiRequest {
    action: string;
    moduleId?: string;
    data?: any;
    timestamp: string;
    requestId?: string;
}

export interface ModularApiResponse {
    success: boolean;
    data?: any;
    error?: string;
    moduleId?: string;
    timestamp: string;
    requestId?: string;
}

export interface ModuleHealth {
    moduleId: string;
    status: 'active' | 'inactive' | 'error' | 'starting' | 'stopping';
    lastHeartbeat: string;
    uptime: number;
    memory?: {
        used: number;
        total: number;
        percentage: number;
    };
    cpu?: {
        percentage: number;
        load: number[];
    };
    customMetrics?: Record<string, any>;
}

export interface CommunicationEvent {
    type: 'register' | 'unregister' | 'heartbeat' | 'request' | 'response' | 'broadcast';
    source: string;
    target?: string;
    data: any;
    timestamp: string;
    priority?: 'low' | 'normal' | 'high' | 'critical';
}

// Event types for module lifecycle
export type ModuleLifecycleEvent = 
    | 'module.registered'
    | 'module.unregistered'
    | 'module.started'
    | 'module.stopped'
    | 'module.error'
    | 'module.heartbeat'
    | 'module.communication';

export interface ModuleEventData {
    moduleId: string;
    event: ModuleLifecycleEvent;
    timestamp: string;
    data?: any;
    error?: string;
}

// Security and protection interfaces (for future @modular/RobusT integration)
export interface SecurityContext {
    authenticated: boolean;
    userId?: string;
    roles?: string[];
    permissions?: string[];
    sessionId?: string;
    tokenType?: 'bearer' | 'api-key' | 'custom';
}

export interface ProtectionLevel {
    level: 'none' | 'basic' | 'standard' | 'high' | 'maximum';
    encryption: boolean;
    authentication: boolean;
    authorization: boolean;
    rateLimit?: {
        requests: number;
        timeWindow: number; // in seconds
    };
}
