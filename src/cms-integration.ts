import { Application } from 'express';
import { createModularApp, startModularServer } from './index';
import { modularService } from './services/modularService';
import { ModuleConfig, ModularApiResponse, ModuleHealth } from './types/modular';

/**
 * ModulaR CMS Integration Helper
 * This class provides easy integration of ModulaR API into a CMS
 */
export class ModularCMS {
  private app: Application | null = null;
  private server: any = null;
  private isRunning: boolean = false;

  constructor() {
    // Set up event listeners for module lifecycle events
    this.setupEventListeners();
  }

  /**
   * Initialize ModulaR API as part of an existing Express app
   */
  integrateWithApp(existingApp: Application, basePath: string = '/api/modular'): void {
    const modularApp = createModularApp();
    
    // Mount the modular routes on the existing app
    existingApp.use(basePath, modularApp);
    
    console.log(`🔗 ModulaR API integrated at ${basePath}`);
  }

  /**
   * Start ModulaR API as a standalone service
   */
  async startStandaloneServer(port?: number): Promise<void> {
    if (this.isRunning) {
      throw new Error('ModulaR API server is already running');
    }

    try {
      this.server = await startModularServer(port);
      this.isRunning = true;
      console.log('✅ ModulaR API server started successfully');
    } catch (error) {
      console.error('❌ Failed to start ModulaR API server:', error);
      throw error;
    }
  }

  /**
   * Stop the ModulaR API server
   */
  async stopServer(): Promise<void> {
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
  getRegisteredModules(): ModuleConfig[] {
    return modularService.getRegisteredModules();
  }

  /**
   * Get a specific module by ID
   */
  getModule(moduleId: string): ModuleConfig | undefined {
    return modularService.getModule(moduleId);
  }

  /**
   * Get health status of all modules
   */
  getModuleHealthStatus(): ModuleHealth[] {
    return modularService.getAllModuleHealth();
  }

  /**
   * Send a command to a specific module
   */
  async sendCommandToModule(moduleId: string, action: string, data?: any): Promise<ModularApiResponse> {
    return modularService.sendCommunication(moduleId, action, data);
  }

  /**
   * Broadcast a message to all registered modules
   */
  async broadcastToAllModules(action: string, data?: any): Promise<ModularApiResponse> {
    return modularService.broadcastToModules(action, data);
  }

  /**
   * Register an event handler for module lifecycle events
   */
  onModuleEvent(event: string, handler: (data: any) => void): void {
    modularService.on(event, handler);
  }

  /**
   * Remove an event handler
   */
  offModuleEvent(event: string, handler: (data: any) => void): void {
    modularService.off(event, handler);
  }

  /**
   * Get communication logs
   */
  getCommunicationLogs(limit?: number) {
    return modularService.getCommunicationLog(limit);
  }

  /**
   * Check if the server is running
   */
  isServerRunning(): boolean {
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

  private setupEventListeners(): void {
    // Listen for module registration events
    modularService.on('module.registered', (eventData) => {
      console.log(`📝 Module registered: ${eventData.moduleId}`);
    });

    // Listen for module unregistration events
    modularService.on('module.unregistered', (eventData) => {
      console.log(`🗑️ Module unregistered: ${eventData.moduleId}`);
    });

    // Listen for module errors
    modularService.on('module.error', (eventData) => {
      console.warn(`⚠️ Module error: ${eventData.moduleId} - ${eventData.error}`);
    });

    // Listen for module heartbeats
    modularService.on('module.heartbeat', (eventData) => {
      // Optionally log heartbeats (commented out to avoid spam)
      // console.log(`💓 Heartbeat from: ${eventData.moduleId}`);
    });
  }
}

// Export a singleton instance for easy use
export const modularCMS = new ModularCMS();
