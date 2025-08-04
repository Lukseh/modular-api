# 📦 @modular/api - Usage Guide

Complete guide for using the ModulaR API package after building with `yarn build`.

## 🚀 Installation & Build

```bash
# Install dependencies
yarn install

# Build the package
yarn build

# The package is now ready to use from the dist/ folder
```

## 📋 Import Options

### For Module Apps (Simple Import)

```typescript
// Import everything
import * as ModularAPI from '@modular/api';

// Or import specific components
import { 
  createModularClient, 
  ModularClient, 
  ModuleConfig 
} from '@modular/api';

// Or import just the client
import { createModularClient } from '@modular/api/client';
```

### For CMS Integration

```typescript
// Import CMS helper
import { ModularCMS, modularCMS } from '@modular/api/cms';

// Or import everything
import * as ModularAPI from '@modular/api';
const cms = new ModularAPI.ModularCMS();
```

## 🎯 Usage Examples

### 1. Simple Module App Integration

```typescript
import { createModularClient, ModuleConfig } from '@modular/api';

// Define your module
const moduleConfig: ModuleConfig = {
  moduleId: 'my-app',
  moduleName: 'My Application',
  version: '1.0.0',
  capabilities: [
    { name: 'data-processing', description: 'Process user data' }
  ],
  endpoints: [
    { path: '/api/data', method: 'GET', description: 'Get data' }
  ]
};

// Create client and register
const client = createModularClient({
  apiUrl: 'http://localhost:7474/api/modular',
  moduleConfig
});

// In your app startup
async function startApp() {
  try {
    await client.register();
    console.log('✅ Registered with ModulaR CMS');
  } catch (error) {
    console.error('❌ Registration failed:', error);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await client.shutdown();
  process.exit(0);
});
```

### 2. CMS Integration (Embedded)

```typescript
import express from 'express';
import { modularCMS } from '@modular/api/cms';

const app = express();

// Option 1: Integrate with existing Express app
modularCMS.integrateWithApp(app, '/modular');

// Listen for module events
modularCMS.onModuleEvent('module.registered', (data) => {
  console.log('New module registered:', data.moduleId);
});

app.listen(3000, () => {
  console.log('CMS running with ModulaR integration');
});
```

### 3. CMS Integration (Standalone Server)

```typescript
import { modularCMS } from '@modular/api/cms';

// Start ModulaR API as separate service
async function startCMS() {
  try {
    await modularCMS.startStandaloneServer(7474);
    
    // Monitor modules
    setInterval(() => {
      const stats = modularCMS.getServerStats();
      console.log('📊 Server stats:', stats);
    }, 30000);
    
  } catch (error) {
    console.error('Failed to start ModulaR API:', error);
  }
}

startCMS();
```

### 4. Advanced CMS Usage

```typescript
import { ModularCMS } from '@modular/api/cms';

class MyCMS {
  private modular: ModularCMS;
  
  constructor() {
    this.modular = new ModularCMS();
    this.setupModularIntegration();
  }
  
  private setupModularIntegration() {
    // Listen for module lifecycle events
    this.modular.onModuleEvent('module.registered', (data) => {
      this.handleModuleRegistration(data);
    });
    
    this.modular.onModuleEvent('module.error', (data) => {
      this.handleModuleError(data);
    });
  }
  
  async deployModule(moduleId: string, config: any) {
    // Send deployment command to module
    return await this.modular.sendCommandToModule(
      moduleId, 
      'deploy', 
      config
    );
  }
  
  async broadcastSystemUpdate(message: string) {
    return await this.modular.broadcastToAllModules(
      'systemUpdate',
      { message, timestamp: new Date().toISOString() }
    );
  }
  
  getModuleStats() {
    return {
      modules: this.modular.getRegisteredModules(),
      health: this.modular.getModuleHealthStatus(),
      stats: this.modular.getServerStats()
    };
  }
  
  private handleModuleRegistration(data: any) {
    console.log(`📝 Module ${data.moduleId} registered`);
    // Custom CMS logic for new modules
  }
  
  private handleModuleError(data: any) {
    console.error(`⚠️ Module ${data.moduleId} error:`, data.error);
    // Custom error handling
  }
}
```

### 5. Direct API Router Usage

```typescript
import express from 'express';
import { modularApiRouter } from '@modular/api';

const app = express();
app.use(express.json());

// Mount the ModulaR API at custom path
app.use('/my-custom-path', modularApiRouter);

app.listen(3000);
```

## 📁 Package Structure After Build

```
dist/
├── index.js                 # Main entry point
├── index.d.ts              # TypeScript definitions
├── server.js               # Standalone server
├── cms-integration.js      # CMS helper class
├── services/
│   ├── modularClient.js    # Client SDK for modules
│   └── modularService.js   # Core service logic
├── types/
│   └── modular.js         # Type definitions
├── functions/
│   └── modular-api.js     # API router
├── controllers/
├── routes/
└── examples/
    └── exampleModule.js   # Example implementation
```

## 🔧 Configuration Options

### Environment Variables

```bash
# Port for standalone server
PORT=7474

# API URL for client connections
MODULAR_API_URL=http://localhost:7474/api/modular

# Module-specific port
MODULE_PORT=3001
```

### ModularClient Options

```typescript
const clientOptions = {
  apiUrl: 'http://localhost:7474/api/modular',
  moduleConfig: { /* your config */ },
  heartbeatInterval: 30000,  // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000          // 1 second
};
```

## 🚦 Running Examples

### Start Standalone Server
```bash
# After building
node dist/server.js

# Or using package script
yarn start
```

### Run Example Module
```bash
# After building
node dist/examples/exampleModule.js

# Or using package script
yarn example
```

### Run Tests
```bash
# After building
yarn test
```

## 📊 API Endpoints

When the server is running, these endpoints are available:

- `POST /api/modular/register` - Register a module
- `GET /api/modular/modules` - List all modules
- `GET /api/modular/modules/:id` - Get module details
- `DELETE /api/modular/modules/:id` - Unregister module
- `POST /api/modular/heartbeat/:id` - Send heartbeat
- `POST /api/modular/communicate/:id` - Send command to module
- `POST /api/modular/broadcast` - Broadcast to all modules
- `GET /api/modular/health` - System health check
- `GET /api/modular/logs` - Communication logs

## 🔄 Event System

```typescript
// Available events for CMS integration
modularCMS.onModuleEvent('module.registered', handler);
modularCMS.onModuleEvent('module.unregistered', handler);
modularCMS.onModuleEvent('module.error', handler);
modularCMS.onModuleEvent('module.heartbeat', handler);

// Available events for modules
client.on('registered', handler);
client.on('unregistered', handler);
client.on('heartbeatSent', handler);
client.on('communicationReceived', handler);
```

## 🔮 Future @modular/RobusT Integration

The package is designed to work seamlessly with the upcoming security package:

```typescript
// Future usage
import { robust } from '@modular/robust';
import { modularApiRouter } from '@modular/api';

app.use('/api/modular', 
  robust.protect({ level: 'high' }),
  modularApiRouter
);
```

## 🚀 Production Deployment

1. **Build the package**: `yarn build`
2. **For modules**: Import and use the client SDK
3. **For CMS**: Use the CMS integration helper
4. **For standalone**: Run `node dist/server.js`

The package is now ready for production use with full TypeScript support and comprehensive error handling!
