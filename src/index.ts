import express, { Application, Request, Response } from 'express';
import modularApiRouter from './functions/modular-api';
import userRoutes from './routes/userRoutes';
import { ModularCMS, modularCMS } from './cms-integration';

export const PORT = parseInt(process.env.PORT || '7474', 10);

// Create and configure the Express app
export function createModularApp(): Application {
  const app: Application = express();
  
  app.use(express.json());
  
  // Use the modular API router
  app.use('/api/modular', modularApiRouter);
  app.use('/api', userRoutes);
  
  // Root endpoint
  app.get('/', (req: Request, res: Response) => {
    res.json({
      message: 'ModulaR API Server',
      version: '1.0.0',
      description: 'API package for connecting Node.js apps as modules to ModulaR CMS',
      documentation: 'See README.md for complete API documentation',
      endpoints: {
        modular: '/api/modular',
        users: '/api/users',
        health: '/api/health'
      },
      modularEndpoints: {
        register: 'POST /api/modular/register',
        modules: 'GET /api/modular/modules',
        moduleById: 'GET /api/modular/modules/:moduleId',
        unregister: 'DELETE /api/modular/modules/:moduleId',
        heartbeat: 'POST /api/modular/heartbeat/:moduleId',
        communicate: 'POST /api/modular/communicate/:moduleId',
        broadcast: 'POST /api/modular/broadcast',
        health: 'GET /api/modular/health',
        logs: 'GET /api/modular/logs',
        capabilities: 'GET /api/modular/modules/:moduleId/capabilities'
      }
    });
  });
  
  return app;
}

// Start the server (for CMS integration)
export function startModularServer(port: number = PORT): Promise<any> {
  return new Promise((resolve, reject) => {
    const app = createModularApp();
    
    const server = app.listen(port, () => {
      console.log(`🚀 ModulaR API Server is listening on port ${port}`);
      console.log(`📋 API Documentation: http://localhost:${port}/`);
      console.log(`🔗 Modular endpoints available at: http://localhost:${port}/api/modular`);
      console.log(`📊 Health check: http://localhost:${port}/api/modular/health`);
      resolve(server);
    });
    
    server.on('error', (error) => {
      reject(error);
    });
  });
}

// Export the configured app instance for direct use
export const app = createModularApp();

// Export all important components for use as a package
export * from './types/modular';
export { modularService } from './services/modularService';
export { createModularClient, createExampleModuleConfig, ModularClient } from './services/modularClient';
export { default as modularApiRouter } from './functions/modular-api';
export { ModularCMS, modularCMS } from './cms-integration';

// Default export for CMS integration
export default {
  createApp: createModularApp,
  startServer: startModularServer,
  app,
  PORT,
  ModularCMS,
  cms: modularCMS
};