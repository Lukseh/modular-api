/**
 * Example CMS Application using ModulaR API
 * This demonstrates how a CMS would integrate and run the ModulaR API
 */
declare class ExampleCMS {
    private app;
    private modular;
    private server;
    constructor();
    private setupCMS;
    private setupModularEventHandlers;
    startWithIntegratedAPI(port?: number): Promise<any>;
    startWithSeparateAPI(cmsPort?: number, apiPort?: number): Promise<any>;
    startWithDirectServer(cmsPort?: number, apiPort?: number): Promise<any>;
    stop(): Promise<void>;
}
export { ExampleCMS };
//# sourceMappingURL=cms-example.d.ts.map