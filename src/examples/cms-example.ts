/**
 * Example CMS Application using ModulaR API
 * This demonstrates how a CMS would integrate and run the ModulaR API
 */

import express from 'express';
import { ModularCMS } from '../cms-integration';
import { startModularServer } from '../index';
import { ModuleConfig, ModuleHealth } from '../types/modular';

class ExampleCMS {
  private app: express.Application;
  private modular: ModularCMS;
  private server: any;

  constructor() {
    this.app = express();
    this.modular = new ModularCMS();
    this.setupCMS();
  }

  private setupCMS() {
    this.app.use(express.json());
    
    // CMS specific routes
    this.app.get('/', (req, res) => {
      res.json({
        name: 'Example CMS',
        version: '1.0.0',
        message: 'CMS running with ModulaR integration',
        modularStats: this.modular.getServerStats()
      });
    });

    // CMS dashboard endpoint
    this.app.get('/dashboard', (req, res) => {
      const stats = this.modular.getServerStats();
      const modules = this.modular.getRegisteredModules();
      const health = this.modular.getModuleHealthStatus();
      
      res.json({
        cms: 'Example CMS Dashboard',
        timestamp: new Date().toISOString(),
        modular: {
          stats,
          modules: modules.map((m: ModuleConfig) => ({
            id: m.moduleId,
            name: m.moduleName,
            version: m.version,
            capabilities: m.capabilities.length,
            endpoints: m.endpoints.length
          })),
          health: health.map((h: ModuleHealth) => ({
            moduleId: h.moduleId,
            status: h.status,
            uptime: h.uptime,
            lastHeartbeat: h.lastHeartbeat
          }))
        }
      });
    });

    // CMS admin endpoints for module management
    this.app.post('/admin/modules/:moduleId/command', async (req, res) => {
      try {
        const { moduleId } = req.params;
        const { action, data } = req.body;
        
        const result = await this.modular.sendCommandToModule(moduleId, action, data);
        res.json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/admin/broadcast', async (req, res) => {
      try {
        const { action, data } = req.body;
        const result = await this.modular.broadcastToAllModules(action, data);
        res.json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Setup ModulaR event handlers
    this.setupModularEventHandlers();
  }

  private setupModularEventHandlers() {
    this.modular.onModuleEvent('module.registered', (data: any) => {
      console.log(`🎉 CMS: New module registered - ${data.moduleId}`);
      // CMS could trigger workflows, notifications, etc.
    });

    this.modular.onModuleEvent('module.unregistered', (data: any) => {
      console.log(`👋 CMS: Module unregistered - ${data.moduleId}`);
      // CMS cleanup logic
    });

    this.modular.onModuleEvent('module.error', (data: any) => {
      console.warn(`⚠️ CMS: Module error - ${data.moduleId}: ${data.error}`);
      // CMS error handling, alerting, etc.
    });
  }

  // Method 1: Integrate ModulaR API into the same Express app
  async startWithIntegratedAPI(port: number = 3000) {
    console.log('🚀 Starting CMS with integrated ModulaR API...');
    
    // Integrate ModulaR API routes into this Express app
    this.modular.integrateWithApp(this.app, '/api/modular');
    
    this.server = this.app.listen(port, () => {
      console.log(`✅ CMS running on http://localhost:${port}`);
      console.log(`🔗 ModulaR API available at http://localhost:${port}/api/modular`);
      console.log(`📊 Dashboard at http://localhost:${port}/dashboard`);
    });

    return this.server;
  }

  // Method 2: Run ModulaR API as separate service
  async startWithSeparateAPI(cmsPort: number = 3000, apiPort: number = 7474) {
    console.log('🚀 Starting CMS with separate ModulaR API service...');
    
    // Start ModulaR API as standalone service
    await this.modular.startStandaloneServer(apiPort);
    
    this.server = this.app.listen(cmsPort, () => {
      console.log(`✅ CMS running on http://localhost:${cmsPort}`);
      console.log(`🔗 ModulaR API running on http://localhost:${apiPort}`);
      console.log(`📊 Dashboard at http://localhost:${cmsPort}/dashboard`);
    });

    return this.server;
  }

  // Method 3: Use the exported startModularServer function directly
  async startWithDirectServer(cmsPort: number = 3000, apiPort: number = 7474) {
    console.log('🚀 Starting CMS with direct ModulaR server...');
    
    // Start ModulaR server directly using exported function
    await startModularServer(apiPort);
    
    this.server = this.app.listen(cmsPort, () => {
      console.log(`✅ CMS running on http://localhost:${cmsPort}`);
      console.log(`🔗 ModulaR API running on http://localhost:${apiPort}`);
      console.log(`📊 Dashboard at http://localhost:${cmsPort}/dashboard`);
    });

    return this.server;
  }

  async stop() {
    console.log('🛑 Shutting down CMS...');
    
    if (this.modular.isServerRunning()) {
      await this.modular.stopServer();
    }
    
    if (this.server) {
      this.server.close();
    }
    
    console.log('✅ CMS shutdown complete');
  }
}

// Demonstration function
async function demonstrateCMSUsage() {
  const cms = new ExampleCMS();
  
  console.log('📋 CMS Demonstration - Choose a method:');
  console.log('1. Integrated API (same Express app)');
  console.log('2. Separate API service');
  console.log('3. Direct server function');
  
  // For demonstration, we'll use method 1 (integrated)
  console.log('\n🎯 Using Method 1: Integrated API');
  
  try {
    await cms.startWithIntegratedAPI(3000);
    
    // Simulate some CMS activity
    setTimeout(async () => {
      console.log('\n📊 CMS Status Check:');
      const stats = cms['modular'].getServerStats();
      console.log('   Modular Stats:', stats);
    }, 2000);
    
    return cms;
    
  } catch (error) {
    console.error('❌ Failed to start CMS:', error);
    throw error;
  }
}

// Handle graceful shutdown
function setupGracefulShutdown(cms: ExampleCMS) {
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}, shutting down...`);
    await cms.stop();
    process.exit(0);
  };
  
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// Run if this file is executed directly
if (require.main === module) {
  demonstrateCMSUsage()
    .then((cms) => {
      console.log('\n🎉 CMS started successfully!');
      console.log('📝 Try these URLs:');
      console.log('   http://localhost:3000/ - CMS Home');
      console.log('   http://localhost:3000/dashboard - CMS Dashboard');
      console.log('   http://localhost:3000/api/modular/health - ModulaR Health');
      console.log('\nPress Ctrl+C to stop the CMS');
      
      setupGracefulShutdown(cms);
    })
    .catch((error) => {
      console.error('💥 CMS startup failed:', error);
      process.exit(1);
    });
}

export { ExampleCMS };
