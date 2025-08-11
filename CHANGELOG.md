# Changelog

All notable changes to the @modular-cms/api package will be documented in this file.

## [1.1.0] - 2025-01-11

### 🚀 Major Release - Unified Elysia/Bun Package

#### Added
- **Unified Package Architecture**: Single package that can be imported by both CMS and Module applications
- **CMS Namespace**: `CMS.*` functions for CMS systems (server-side operations)
- **Module Namespace**: `Module.*` functions for Module applications (client-side operations)
- **Types Namespace**: Shared type definitions for both CMS and modules
- **Version Groups**: API versioning with `/v1` and `/v2` groups for backward compatibility
- **Enhanced Swagger Documentation**: Organized by version tags with comprehensive API documentation
- **Auto-start Server**: Automatic server startup when imported as main module
- **Production Ready**: Optimized for production deployment with proper error handling

#### Features
- **Elysia/Bun Based**: High-performance API server using Elysia framework
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- **API Versioning**: Group-based versioning (`/api/v1`, `/api/v2`) for easy version management
- **Module Registration**: Simple module registration system for connecting external applications
- **Health Monitoring**: Built-in health checks and heartbeat system
- **Communication System**: Bidirectional communication between CMS and modules
- **Event System**: Real-time event handling for module lifecycle events
- **Swagger Integration**: Auto-generated API documentation with version grouping

#### API Endpoints
- `GET /api/` - API information and available versions
- `GET /api/swagger` - Interactive API documentation
- `POST /api/v1/register` - Register a new module
- `GET /api/v1/modules` - List all registered modules
- `GET /api/v1/health` - System health check
- `POST /api/v1/heartbeat/:moduleId` - Send module heartbeat
- `POST /api/v1/communicate/:moduleId` - Send command to module
- `POST /api/v1/broadcast` - Broadcast to all modules
- `GET /api/v1/logs` - Communication logs

#### Usage Examples

**For CMS Systems:**
```typescript
import { CMS } from '@modular-cms/api'

// Start API server
const server = CMS.createAPIServer({ port: 3000 })

// Manage modules
const modules = CMS.getRegisteredModules()
await CMS.sendCommandToModule('module-id', 'deploy', config)
```

**For Module Applications:**
```typescript
import { Module } from '@modular-cms/api'

// Create client
const client = Module.createClient({
  apiUrl: 'http://localhost:3000/api/v1',
  moduleConfig: Module.createConfig({
    moduleId: 'my-module',
    moduleName: 'My Module',
    version: '1.0.0'
  })
})

// Register routes and connect
client.routes.get('/api/data', () => ({ data: 'example' }))
await client.register()
```

#### Technical Improvements
- **Build System**: Optimized TypeScript compilation for production
- **Package Exports**: Multiple export paths for different use cases
- **Peer Dependencies**: Proper TypeScript peer dependency configuration
- **Engine Requirements**: Node.js 18+ and Bun 1.0+ support
- **Publishing**: Automated publishing scripts with dry-run support

#### Performance Improvements
- **4.45x faster throughput**: From ~330K to 1.47M requests per minute
- **5.18x lower latency**: Response times improved from 57ms to 11ms
- **2.56x better data throughput**: Improved from 2.15 to 5.5 MB/sec
- **Zero-error reliability**: Perfect stability under heavy load

#### Publishing & Development
- **GitHub Actions**: Production publishing handled via CI/CD
- **Source Exclusion**: Source folders (`src/`, `src-elysia/`) excluded from published package
- **Dry Run Validation**: Local package validation with `bun run publish:dry`
- **Package Validation**: Comprehensive pre-publish checks
- **Clean Distribution**: Only compiled code and essential docs in published package

### Changed
- **Architecture**: Complete rewrite from Express-based to Elysia-based system
- **Package Structure**: Unified package replacing separate CMS and module packages
- **API Structure**: Group-based versioning instead of flat endpoint structure
- **Build Target**: Optimized for Bun runtime while maintaining Node.js compatibility
- **Publishing**: Moved to GitHub Actions for security and automation

### Migration Guide
Updating from previous versions requires changes to import statements:

**Before (Express-based versions):**
```typescript
import { createModularClient } from '@modular-cms/api'
const client = createModularClient(config)
```

**After (v1.1.0):**
```typescript
import { Module } from '@modular-cms/api'
const client = Module.createClient(config)
```

### Development Scripts
```bash
# Build and validate package
bun run build

# Dry run publish (validation only)
bun run publish:dry

# Complete package validation
bun run publish:validate

# Check package contents
bun run publish:check

# Run benchmarks
bun run benchmark
```

## [1.0.x] - Legacy Express-Based Versions
- Express-based implementation
- Separate CMS and module packages
- Node.js focused
- Limited performance capabilities

**Note**: Previous versions (1.0.x) were development versions with Express-based architecture. Version 1.1.0 represents the first major production release with the new Elysia/Bun architecture.

---

## Future Releases

### [1.2.0] - Planned
- **Enhanced Security**: Integration with @modular/robust package
- **Real-time Events**: WebSocket support for real-time communication
- **Advanced Monitoring**: Enhanced health checks and metrics
- **Plugin System**: Extensible plugin architecture

### [2.0.0] - Future
- **API v2**: Enhanced API with new features
- **Microservice Support**: Advanced microservice orchestration
- **GraphQL Support**: Optional GraphQL API alongside REST
- **Advanced Security**: Multi-layer security system
