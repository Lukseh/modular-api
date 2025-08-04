# ModulaR API Package

This package provides a comprehensive API for connecting Node.js applications as modules to the ModulaR CMS system. It enables seamless communication, module registration, health monitoring, and data exchange between the CMS and module apps.

## Features

- **Module Registration**: Register your Node.js app as a module in ModulaR CMS
- **Health Monitoring**: Automatic heartbeat system with health status reporting
- **Communication Protocol**: Bidirectional communication between CMS and modules
- **Event-Driven Architecture**: Real-time event handling and notifications
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Retry Logic**: Built-in retry mechanisms for reliable communication
- **Future Ready**: Prepared for @modular/RobusT integration for enhanced security

## Installation

```bash
# Install the package
yarn add @modular-cms/api

# For development
yarn add -D @modular-cms/api
```

## Development Setup

### Prerequisites

- Node.js 20 or higher
- Yarn 4.9.1 (managed by Corepack)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/Lukseh/modular-api.git
cd modular-api

# Option 1: Use setup script (recommended)
# On Windows:
setup.bat
# On Unix/Linux/macOS:
chmod +x setup.sh && ./setup.sh

# Option 2: Manual setup
# Enable Corepack (if not already enabled)
corepack enable

# Install dependencies (this will create yarn.lock if it doesn't exist)
yarn install

# Build the project
yarn build

# Start development server
yarn dev
```

**Note**: If you encounter the `--immutable` error, it means yarn.lock doesn't exist yet. Simply run `yarn install` once to create it, then commit the file to your repository.

## API Endpoints

### Module Management

#### Register Module
```http
POST /api/modular/register
Content-Type: application/json

{
  "moduleId": "my-module",
  "moduleName": "My Custom Module",
  "version": "1.0.0",
  "description": "A custom module for ModulaR CMS",
  "capabilities": [
    {
      "name": "data-processing",
      "description": "Process various data types",
      "version": "1.0.0"
    }
  ],
  "endpoints": [
    {
      "path": "/api/data",
      "method": "GET",
      "description": "Get processed data",
      "protected": true
    }
  ]
}
```

#### Get All Modules
```http
GET /api/modular/modules
```

#### Get Specific Module
```http
GET /api/modular/modules/{moduleId}
```

#### Unregister Module
```http
DELETE /api/modular/modules/{moduleId}
```

### Health Monitoring

#### Send Heartbeat
```http
POST /api/modular/heartbeat/{moduleId}
Content-Type: application/json

{
  "memory": {
    "used": 50000000,
    "total": 100000000,
    "percentage": 50
  },
  "cpu": {
    "percentage": 25,
    "load": [1.2, 1.1, 1.0]
  }
}
```

#### Get System Health
```http
GET /api/modular/health
```

### Communication

#### Send Communication to Module
```http
POST /api/modular/communicate/{moduleId}
Content-Type: application/json

{
  "action": "processData",
  "data": {
    "input": "some data to process"
  }
}
```

#### Broadcast to All Modules
```http
POST /api/modular/broadcast
Content-Type: application/json

{
  "action": "systemUpdate",
  "data": {
    "message": "System will restart in 5 minutes"
  }
}
```

### Logging and Monitoring

#### Get Communication Logs
```http
GET /api/modular/logs?limit=100
```

#### Get Module Capabilities
```http
GET /api/modular/modules/{moduleId}/capabilities
```

## Client SDK Usage

### Basic Setup

```typescript
import { createModularClient, createExampleModuleConfig } from './services/modularClient';

// Create module configuration
const moduleConfig = createExampleModuleConfig('my-app', 'My Application');

// Or create custom configuration
const customConfig = {
  moduleId: 'my-custom-module',
  moduleName: 'My Custom Module',
  version: '1.0.0',
  description: 'A powerful module for ModulaR CMS',
  capabilities: [
    {
      name: 'file-processing',
      description: 'Process uploaded files',
      version: '1.0.0'
    }
  ],
  endpoints: [
    {
      path: '/upload',
      method: 'POST',
      description: 'Upload and process files',
      protected: true
    }
  ]
};

// Create client instance
const client = createModularClient({
  apiUrl: 'http://localhost:7474/api/modular',
  moduleConfig: customConfig,
  heartbeatInterval: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000
});
```

### Registration and Lifecycle

```typescript
// Register the module
try {
  const result = await client.register();
  console.log('Module registered:', result);
} catch (error) {
  console.error('Registration failed:', error);
}

// Listen for events
client.on('registered', (data) => {
  console.log('Successfully registered:', data);
});

client.on('heartbeatSent', (data) => {
  console.log('Heartbeat sent:', data);
});

client.on('communicationReceived', (data) => {
  console.log('Received communication:', data);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await client.shutdown();
  process.exit(0);
});
```

### Module Service Usage

```typescript
import { modularService } from './services/modularService';

// Listen for module events
modularService.on('moduleEvent', (eventData) => {
  console.log('Module event:', eventData);
});

modularService.on('module.registered', (eventData) => {
  console.log('New module registered:', eventData.moduleId);
});

modularService.on('module.error', (eventData) => {
  console.error('Module error:', eventData);
});

// Get all registered modules
const modules = modularService.getRegisteredModules();
console.log('Registered modules:', modules);

// Send communication to a specific module
const result = await modularService.sendCommunication(
  'target-module-id',
  'processData',
  { input: 'some data' }
);
```

## Type Definitions

### Core Types

```typescript
interface ModuleConfig {
  moduleId: string;
  moduleName: string;
  version: string;
  description?: string;
  capabilities: ModuleCapability[];
  endpoints: ModuleEndpoint[];
  dependencies?: ModuleDependency[];
  metadata?: Record<string, any>;
}

interface ModuleCapability {
  name: string;
  description?: string;
  version?: string;
  config?: Record<string, any>;
}

interface ModuleEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description?: string;
  protected?: boolean;
  params?: EndpointParam[];
  response?: EndpointResponse;
}

interface ModularApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  moduleId?: string;
  timestamp: string;
  requestId?: string;
}
```

## Example Implementation

### Simple Module App

```typescript
import express from 'express';
import { createModularClient } from '@modular-cms/api';

const app = express();
const port = 3001;

// Module configuration
const moduleConfig = {
  moduleId: 'simple-module',
  moduleName: 'Simple Module',
  version: '1.0.0',
  capabilities: [
    { name: 'basic-operations', description: 'Basic CRUD operations' }
  ],
  endpoints: [
    { path: '/status', method: 'GET', description: 'Module status' },
    { path: '/data', method: 'GET', description: 'Get data' }
  ]
};

// Create ModulaR client
const modularClient = createModularClient({
  apiUrl: 'http://localhost:7474/api/modular',
  moduleConfig
});

// Register with ModulaR on startup
app.listen(port, async () => {
  console.log(`Module running on port ${port}`);
  
  try {
    await modularClient.register();
    console.log('Registered with ModulaR CMS');
  } catch (error) {
    console.error('Failed to register:', error);
  }
});

// Module endpoints
app.get('/status', (req, res) => {
  res.json({ 
    status: 'active', 
    moduleId: moduleConfig.moduleId,
    timestamp: new Date().toISOString()
  });
});

app.get('/data', (req, res) => {
  res.json({ 
    data: 'Module processed data',
    moduleId: moduleConfig.moduleId
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await modularClient.shutdown();
  process.exit(0);
});
```

## Future Integration: @modular-cms/RobusT

This API is designed to integrate seamlessly with the upcoming `@modular-cms/RobusT` package, which will provide:

- **robust.protect**: Endpoint protection with multiple security layers
- **robust.publish**: Secure data publishing with encryption
- **robust.encrypt**: Advanced encryption for data safety
- **robust.GetJson**: Secure JSON retrieval with protection
- **Step-up Protection**: Graduated security levels based on data sensitivity

### Planned Security Integration

```typescript
// Future usage with @modular/RobusT
import { robust } from '@modular/robust';

// Protected endpoint
app.get('/secure-data', 
  robust.protect({ level: 'high', encryption: true }),
  (req, res) => {
    const secureData = robust.encrypt(sensitiveData);
    res.json(robust.publish(secureData));
  }
);

// Secure communication
const secureResponse = await robust.GetJson('/api/secure-endpoint', {
  protection: 'maximum',
  stepUpAuth: true
});
```

## Development

### Running the API Server

```bash
# Start the ModulaR API server
yarn start

# Development mode with auto-restart
yarn dev

# Build the project
yarn build

# Clean build artifacts
yarn clean
```

### Testing Module Registration

```bash
# Test module registration
curl -X POST http://localhost:7474/api/modular/register \
  -H "Content-Type: application/json" \
  -d '{
    "moduleId": "test-module",
    "moduleName": "Test Module",
    "version": "1.0.0",
    "capabilities": [],
    "endpoints": []
  }'

# Check registered modules
curl http://localhost:7474/api/modular/modules

# Send heartbeat
curl -X POST http://localhost:7474/api/modular/heartbeat/test-module \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'
```

## Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "error": "Description of the error",
  "timestamp": "2025-08-05T10:30:00.000Z",
  "moduleId": "optional-module-id"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created (module registered)
- `400`: Bad Request (validation errors)
- `404`: Not Found (module not found)
- `500`: Internal Server Error

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Install dependencies: `yarn install`
4. Make your changes
5. Build and test: `yarn build`
6. Commit your changes (`git commit -m 'Add some amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please file an issue on the [GitHub repository](https://github.com/Lukseh/modular-api/issues).
