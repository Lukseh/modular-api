# 🚀 @modular-cms/api

[![npm version](https://badge.fury.io/js/@modular-cms%2Fapi.svg)](https://badge.fury.io/js/@modular-cms%2Fapi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Elysia](https://img.shields.io/badge/Elysia-1.3+-purple.svg)](https://elysiajs.com/)
[![Bun](https://img.shields.io/badge/Bun-1.0+-orange.svg)](https://bun.sh/)

**Unified API package for ModulaR CMS** - A high-performance, type-safe package that supports both CMS and Module applications using Elysia and Bun.

## 📦 Installation

```bash
# Using Bun (recommended)
bun add @modular-cms/api

# Using npm
npm install @modular-cms/api

# Using yarn
yarn add @modular-cms/api
```

## ⚡ Performance Benchmarks

**Real-world benchmark results (measured 8/11/2025):**

| Metric | v1.0.2 (Express + Node.js) | v1.1.0 (Elysia + Bun) | Improvement |
|--------|----------------------------|------------------------|-------------|
| **Requests/sec** | 5,497 req/sec | 24,462 req/sec | **🚀 4.45x faster** |
| **Requests/min** | 329,810 req/min | **1,467,744 req/min** | **🚀 4.45x faster** |
| **Latency (p50)** | 57ms | 11ms | **⚡ 5.18x faster** |
| **Latency (p99)** | 87ms | 18ms | **⚡ 4.83x faster** |
| **Throughput** | 2.15 MB/sec | 5.5 MB/sec | **📊 2.56x faster** |
| **Errors** | 0 | 0 | **✅ Perfect stability** |

### 🧪 Benchmark Details

**Test Environment:**
- **Hardware**: 12-core CPU, 32GB RAM  
- **OS**: Windows 11 x64
- **Node.js**: v22.17.0
- **Bun**: 1.2.19
- **Load**: 300 concurrent connections, 30-second duration

**Tested Versions:**
- **v1.0.2**: Actual published package `@modular-cms/api@1.0.2`
- **v1.1.0**: Current Elysia/Bun implementation

**Commands Used:**
```bash
# v1.0.2 (Actual Express package)
autocannon -c 300 -d 30 http://localhost:3001/api/modular/health

# v1.1.0 (Elysia + Bun)  
autocannon -c 300 -d 30 http://localhost:3000/api/v1/health
```

### 🎯 **Performance Impact**

🔥 **MASSIVE IMPROVEMENT**

**Key Improvements:**
- 🚀 **4.45x higher throughput** - From 330K to **1,468K requests per minute**
- ⚡ **5.18x lower latency** - Response time improved from 57ms to **11ms**
- 📊 **2.6x better data throughput** - 2.15 MB/sec → **5.5 MB/sec**

### 📊 Real-World Impact

**For a typical CMS with 100 modules:**
- **v1.0.2**: Can handle ~550 module operations per second
- **v1.1.0**: Can handle **~2,446 module operations per second**

**Migration Benefits:**
- **Existing deployments**: 5.18x better response times immediately after upgrade
- **High-traffic scenarios**: 4.45x better capacity without hardware changes  
- **Resource efficiency**: Better resource utilization

## 🎯 Features

- ✅ **Unified Package**: Single package for both CMS and Module applications
- ✅ **High Performance**: Built with Elysia and optimized for Bun
- ✅ **TypeScript First**: Full TypeScript support with comprehensive types
- ✅ **API Versioning**: Group-based versioning (`/v1`, `/v2`) for backward compatibility
- ✅ **Auto Documentation**: Interactive Swagger documentation
- ✅ **Health Monitoring**: Built-in health checks and heartbeat system
- ✅ **Event System**: Real-time module lifecycle events
- ✅ **Production Ready**: Optimized for production deployment

## 🏗️ Architecture

The package provides three main namespaces:

- **`CMS.*`** - Functions for CMS systems (server-side)
- **`Module.*`** - Functions for Module applications (client-side)
- **`Types.*`** - Shared type definitions

## 🚀 Quick Start

### For CMS Systems

```typescript
import { CMS } from '@modular-cms/api'

// Start API server
const server = CMS.createAPIServer({ 
  port: 3000, 
  prefix: '/api' 
})

// Manage modules
const modules = CMS.getRegisteredModules()
const health = CMS.getSystemHealth()

// Send commands to modules
await CMS.sendCommandToModule('blog-module', 'deploy', { version: '1.1.0' })

// Broadcast to all modules
await CMS.broadcastToAllModules('system.update', { 
  message: 'Maintenance tonight' 
})

console.log('🦊 CMS running at http://localhost:3000')
console.log('📚 API Docs: http://localhost:3000/api/swagger')
```

### For Module Applications

```typescript
import { Module, Types } from '@modular-cms/api'

// Create module configuration
const config: Types.ModuleConfig = Module.createConfig({
  moduleId: 'my-blog',
  moduleName: 'Blog Module',
  version: '1.0.0',
  capabilities: [
    { name: 'content-management', description: 'Manage blog posts' }
  ],
  endpoints: [
    { path: '/posts', method: 'GET', description: 'Get blog posts' },
    { path: '/posts', method: 'POST', description: 'Create blog post' }
  ]
})

// Create client
const client = Module.createClient({
  apiUrl: 'http://localhost:3000/api/v1',
  moduleConfig: config,
  heartbeatInterval: 30000
})

// Register simple routes
client.routes.get('/posts', () => ({ posts: getAllPosts() }))
client.routes.post('/posts', (data) => ({ success: createPost(data) }))

// Connect to CMS
await client.register()

// Graceful shutdown
process.on('SIGINT', async () => {
  await client.unregister()
  process.exit(0)
})
```

## 📊 API Endpoints

When the CMS is running, these endpoints are available:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/` | API information and versions |
| `GET` | `/api/swagger` | Interactive API documentation |
| `POST` | `/api/v1/register` | Register a new module |
| `GET` | `/api/v1/modules` | List all registered modules |
| `GET` | `/api/v1/health` | System health check |
| `POST` | `/api/v1/heartbeat/:id` | Send module heartbeat |
| `POST` | `/api/v1/communicate/:id` | Send command to module |
| `POST` | `/api/v1/broadcast` | Broadcast to all modules |
| `GET` | `/api/v1/logs` | Communication logs |

## 🔄 API Versioning

The package supports backward-compatible API versioning:

```typescript
// V1 (current stable)
const clientV1 = Module.createClient({
  apiUrl: 'http://localhost:3000/api/v1',
  moduleConfig: config,
  apiVersion: 'v1'
})

// V2 (future version)
const clientV2 = Module.createClient({
  apiUrl: 'http://localhost:3000/api/v2', 
  moduleConfig: config,
  apiVersion: 'v2'
})
```

## 📚 Advanced Usage

### CMS with Module Monitoring

```typescript
import { CMS } from '@modular-cms/api'

class MyModularCMS {
  private server: any
  
  async start() {
    // Start API server
    this.server = CMS.createAPIServer({ port: 3000 })
    
    // Monitor module events
    CMS.onModuleEvent('module.registered', (data) => {
      console.log('New module:', data.moduleId)
      this.setupModuleRouting(data)
    })
    
    // Periodic health monitoring
    setInterval(() => {
      const health = CMS.getSystemHealth()
      console.log('System health:', health)
    }, 60000)
  }
  
  async deployToModule(moduleId: string, config: any) {
    return await CMS.sendCommandToModule(moduleId, 'deploy', config)
  }
}
```

### Module with Custom Routes

```typescript
import { Module } from '@modular-cms/api'

const apiModule = Module.createClient({
  apiUrl: 'http://localhost:3000/api/v1',
  moduleConfig: Module.createConfig({
    moduleId: 'user-api',
    moduleName: 'User Management API',
    version: '2.1.0',
    capabilities: [
      { name: 'user-auth', description: 'Authentication system' },
      { name: 'user-profiles', description: 'User profile management' }
    ],
    endpoints: [
      { path: '/auth/login', method: 'POST', description: 'User login' },
      { path: '/users/profile', method: 'GET', description: 'Get profile' }
    ]
  })
})

// Register routes
apiModule.routes.post('/auth/login', (credentials) => {
  return authenticateUser(credentials)
})

apiModule.routes.get('/users/profile', () => {
  return getCurrentUserProfile()
})

// Connect to CMS
await apiModule.register()
```

## 🛠️ Development

```bash
# Clone repository
git clone https://github.com/Lukseh/modular-api.git
cd modular-api

# Install dependencies
bun install

# Development mode
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Run benchmarks
bun run benchmark
```

## 📦 Publishing

```bash
# Build and test
bun run build

# Dry run publish
bun run publish:dry

# Publish to npm
bun run publish:prod
```

## 🔮 Roadmap

### Version 1.2.0
- **Enhanced Security**: Integration with @modular/robust
- **Real-time Events**: WebSocket support
- **Advanced Monitoring**: Enhanced metrics and analytics

### Version 2.0.0
- **API v2**: New features and improvements
- **GraphQL Support**: Optional GraphQL API
- **Microservice Orchestration**: Advanced service management

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **GitHub**: [https://github.com/Lukseh/modular-api](https://github.com/Lukseh/modular-api)
- **npm**: [https://www.npmjs.com/package/@modular-cms/api](https://www.npmjs.com/package/@modular-cms/api)
- **Documentation**: [GitHub Wiki](https://github.com/Lukseh/modular-api/wiki)
- **Issues**: [GitHub Issues](https://github.com/Lukseh/modular-api/issues)

## 🏆 Related Projects

- **ModulaR CMS**: Main CMS system (in development)
- **LunaR**: Bun-based fork of ModulaR CMS
- **@modular/robust**: Security package (planned)

---

**Built with ❤️ for the ModulaR ecosystem**
