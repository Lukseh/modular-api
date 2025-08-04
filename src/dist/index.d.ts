import express, { Application } from 'express';
import { ModularCMS } from './cms-integration';
export declare const PORT: number;
export declare function createModularApp(): Application;
export declare function startModularServer(port?: number): Promise<any>;
export declare const app: express.Application;
export * from './types/modular';
export { modularService } from './services/modularService';
export { createModularClient, createExampleModuleConfig, ModularClient } from './services/modularClient';
export { default as modularApiRouter } from './functions/modular-api';
export { ModularCMS, modularCMS } from './cms-integration';
declare const _default: {
    createApp: typeof createModularApp;
    startServer: typeof startModularServer;
    app: express.Application;
    PORT: number;
    ModularCMS: typeof ModularCMS;
    cms: ModularCMS;
};
export default _default;
//# sourceMappingURL=index.d.ts.map