//Includes
import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { ModulaR } from './model'
import { modularService } from './service'

// Variables
const PORT = process.env.PORT || 3000
const VERSION = '1.1.0'

// ========================================
// UNIFIED MODULAR API PACKAGE
// This package can be imported by both CMS and Modules
// ========================================

// For CMS: Complete API server and management functions
export namespace CMS {
  // Create and configure the Elysia API server for CMS
  export function createAPIServer(config?: { port?: number; prefix?: string }) {
    const port = config?.port || PORT
    const prefix = config?.prefix || '/api'
    
    const app = new Elysia({
      prefix,
      normalize: true
    })
      .use(swagger({
        documentation: {
          info: {
            title: 'ModulaR CMS API',
            version: VERSION,
            description: 'API for apps to register as modules with ModulaR CMS'
          },
          tags: [
            {
              name: 'v1',
              description: 'Version 1 API endpoints - Current stable version'
            },
            {
              name: 'v2',
              description: 'Version 2 API endpoints - Future version (placeholder)'
            },
            {
              name: 'System',
              description: 'System-wide endpoints and information'
            }
          ]
        }
      }))
      
      .get('/', () => ({
        message: 'ModulaR CMS API Server',
        version: VERSION,
        description: 'API for apps to register as modules with ModulaR CMS',
        documentation: `${prefix}/swagger`,
        versions: {
          v1: 'Current stable version',
          v2: 'Future version (planned)'
        },
        endpoints: {
          v1: `${prefix}/v1`,
          v2: `${prefix}/v2`,
          health: `${prefix}/v1/health`,
          register: `${prefix}/v1/register`
        }
      }), {
        tags: ['System'],
        summary: 'API Information',
        description: 'Get basic information about the ModulaR API server and available versions'
      })
      
      // V1 API Group - Current stable version
      .group('/v1', (app) =>
        app
          .get('/health', () => modularService.getSystemHealth(), {
            tags: ['v1'],
            summary: 'System Health Check',
            description: 'Check the health status of the ModulaR API server and get module statistics'
          })
          
          .post('/register', async ({ body, set }) => {
            try {
              return await modularService.registerModule(body as ModulaR.ModuleConfig)
            } catch (error: any) {
              set.status = 400
              return { success: false, error: error.message }
            }
          }, {
            tags: ['v1'],
            summary: 'Register Module',
            description: 'Register a new module with the CMS. Apps call this endpoint to announce their availability and capabilities.',
            body: ModulaR.ModuleConfig
          })
          
          .get('/modules', () => ({
            modules: modularService.getModules(),
            total: modularService.getModules().length,
            timestamp: new Date().toISOString()
          }), {
            tags: ['v1'],
            summary: 'List All Modules',
            description: 'Get a list of all registered modules'
          })
          
          .get('/modules/:moduleId', ({ params, set }) => {
            const module = modularService.getModule(params.moduleId)
            if (!module) {
              set.status = 404
              return { error: 'Module not found' }
            }
            return module
          }, {
            tags: ['v1'],
            summary: 'Get Module Details',
            description: 'Get detailed information about a specific module',
            params: t.Object({
              moduleId: t.String()
            })
          })
          
          .delete('/modules/:moduleId', async ({ params, set }) => {
            try {
              return await modularService.unregisterModule(params.moduleId)
            } catch (error: any) {
              set.status = 404
              return { success: false, error: error.message }
            }
          }, {
            tags: ['v1'],
            summary: 'Unregister Module',
            description: 'Remove a module from the CMS',
            params: t.Object({
              moduleId: t.String()
            })
          })
          
          .post('/heartbeat/:moduleId', async ({ params, body, set }) => {
            try {
              return await modularService.processHeartbeat(params.moduleId, body as ModulaR.HeartbeatPayload)
            } catch (error: any) {
              set.status = 404
              return { success: false, error: error.message }
            }
          }, {
            tags: ['v1'],
            summary: 'Send Heartbeat',
            description: 'Send a heartbeat signal to indicate the module is still alive',
            params: t.Object({
              moduleId: t.String()
            }),
            body: t.Optional(ModulaR.HeartbeatPayload)
          })
          
          .post('/communicate/:moduleId', async ({ params, body, set }) => {
            try {
              const { action, data } = body as { action: string; data: any }
              return await modularService.sendCommunication(params.moduleId, action, data)
            } catch (error: any) {
              set.status = 404
              return { success: false, error: error.message }
            }
          }, {
            tags: ['v1'],
            summary: 'Send Communication',
            description: 'Send a message/command to a specific module',
            params: t.Object({
              moduleId: t.String()
            }),
            body: t.Object({
              action: t.String(),
              data: t.Any()
            })
          })
          
          .post('/broadcast', async ({ body }) => {
            const { action, data } = body as { action: string; data: any }
            return await modularService.broadcastCommunication(action, data)
          }, {
            tags: ['v1'],
            summary: 'Broadcast Message',
            description: 'Send a message to all registered modules',
            body: t.Object({
              action: t.String(),
              data: t.Any()
            })
          })
          
          .get('/logs', ({ query }) => {
            const limit = query.limit ? parseInt(query.limit as string) : 100
            return { logs: modularService.getCommunicationLogs(limit) }
          }, {
            tags: ['v1'],
            summary: 'Get Communication Logs',
            description: 'Get recent communication logs between the CMS and modules',
            query: t.Optional(t.Object({
              limit: t.Optional(t.String())
            }))
          })
      )
      
      // V2 API Group - Future version (placeholder for backward compatibility)
      .group('/v2', (app) =>
        app
          .get('/status', () => ({
            version: '2.0.0',
            status: 'planned',
            message: 'API v2 is currently in development',
            availableIn: 'Future releases',
            backwardCompatibility: 'v1 will remain supported'
          }), {
            tags: ['v2'],
            summary: 'V2 Status',
            description: 'Get information about API v2 development status'
          })
          
          // Placeholder endpoints for future v2 features
          .get('/health', () => ({
            ...modularService.getSystemHealth(),
            version: '2.0.0',
            features: ['databases(sql and no-sql)', 'graphql', 'RobusT security', 'caching Redis', 'HAproxy support', 'production safety']
          }), {
            tags: ['v2'],
            summary: 'Enhanced Health Check (v2)',
            description: 'Enhanced health check with additional features (future version)'
          })
      )
      
      .listen(port)
    
    return app
  }
  
  // CMS Management Functions
  export function getRegisteredModules(): ModulaR.ModuleConfig[] {
    return modularService.getModules()
  }
  
  export function getModule(moduleId: string): ModulaR.ModuleConfig | null {
    return modularService.getModule(moduleId)
  }
  
  export function getSystemHealth(): ModulaR.HealthResponse {
    return modularService.getSystemHealth()
  }
  
  export function getModuleHealth() {
    return modularService.getModuleHealth()
  }
  
  export async function sendCommandToModule(moduleId: string, action: string, data?: any) {
    return await modularService.sendCommunication(moduleId, action, data)
  }
  
  export async function broadcastToAllModules(action: string, data?: any) {
    return await modularService.broadcastCommunication(action, data)
  }
  
  export function getCommunicationLogs(limit?: number) {
    return modularService.getCommunicationLogs(limit)
  }
  
  export function onModuleEvent(event: string, handler: (data: any) => void) {
    // Event system implementation would go here
    console.log(`Event handler registered for: ${event}`)
  }
}

// For Modules: Simple registration and communication functions
export namespace Module {
  export interface Config extends ModulaR.ModuleConfig {}
  
  export interface ClientOptions {
    apiUrl: string
    moduleConfig: Config
    heartbeatInterval?: number
    apiVersion?: 'v1' | 'v2' // Allow modules to specify which API version to use
  }
  
  export interface ModuleAPI {
    get(path: string, handler: Function): void
    post(path: string, handler: Function): void
    put(path: string, handler: Function): void
    delete(path: string, handler: Function): void
  }
  
  // Create a client for modules to register with CMS
  export function createClient(options: ClientOptions) {
    let heartbeatInterval: any
    const apiVersion = options.apiVersion || 'v1' // Default to v1 for backward compatibility
    
    return {
      async register(): Promise<{ success: boolean; error?: string }> {
        try {
          console.log(`📝 Registering module: ${options.moduleConfig.moduleId} (API ${apiVersion})`)
          
          // In real implementation, make HTTP request to CMS API
          const response = await fetch(`${options.apiUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(options.moduleConfig)
          })
          
          const result = await response.json() as { success: boolean; error?: string }
          
          if (result.success) {
            // Start heartbeat if registration successful
            this.startHeartbeat()
          }
          
          return result
        } catch (error: any) {
          console.error('Registration failed:', error.message)
          return { success: false, error: error.message }
        }
      },
      
      startHeartbeat() {
        if (heartbeatInterval) return
        
        heartbeatInterval = setInterval(async () => {
          try {
            await fetch(`${options.apiUrl}/heartbeat/${options.moduleConfig.moduleId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: 'active',
                timestamp: new Date().toISOString(),
                apiVersion
              })
            })
            console.log(`💓 Heartbeat sent: ${options.moduleConfig.moduleId} (${apiVersion})`)
          } catch (error) {
            console.error('Heartbeat failed:', error)
          }
        }, options.heartbeatInterval || 30000)
      },
      
      stopHeartbeat() {
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval)
          heartbeatInterval = null
        }
      },
      
      async unregister(): Promise<{ success: boolean }> {
        try {
          this.stopHeartbeat()
          
          await fetch(`${options.apiUrl}/modules/${options.moduleConfig.moduleId}`, {
            method: 'DELETE'
          })
          
          console.log(`🔌 Module unregistered: ${options.moduleConfig.moduleId}`)
          return { success: true }
        } catch (error) {
          console.error('Unregistration failed:', error)
          return { success: false }
        }
      },
      
      // Simple route registration helpers for modules
      routes: {
        get(path: string, handler: Function) {
          console.log(`📋 Module route registered: GET ${path} (${apiVersion})`)
          // This would be part of the module's endpoint config
        },
        
        post(path: string, handler: Function) {
          console.log(`📋 Module route registered: POST ${path} (${apiVersion})`)
        },
        
        put(path: string, handler: Function) {
          console.log(`📋 Module route registered: PUT ${path} (${apiVersion})`)
        },
        
        delete(path: string, handler: Function) {
          console.log(`📋 Module route registered: DELETE ${path} (${apiVersion})`)
        }
      },
      
      // Get API version being used
      getApiVersion() {
        return apiVersion
      }
    }
  }
  
  // Helper to create module config
  export function createConfig(config: Omit<Config, 'capabilities' | 'endpoints'> & {
    capabilities?: Config['capabilities']
    endpoints?: Config['endpoints']
  }): Config {
    return {
      capabilities: [],
      endpoints: [],
      ...config
    }
  }
}

// Common types and utilities
export namespace Types {
  export type ModuleConfig = ModulaR.ModuleConfig
  export type RegistrationResponse = ModulaR.RegistrationResponse
  export type HealthResponse = ModulaR.HealthResponse
  export type HeartbeatPayload = ModulaR.HeartbeatPayload
  export type ApiVersion = 'v1' | 'v2'
}

// Auto-start server if this is the main module (for CMS usage)
let app: any = null

if (typeof require !== 'undefined' && require.main === module) {
  app = CMS.createAPIServer()
  console.log(`🦊 ModulaR CMS API Server running at http://localhost:${PORT}`)
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/swagger`)
  console.log(`🔗 V1 Register endpoint: http://localhost:${PORT}/api/v1/register`)
  console.log(`🔮 V2 Status endpoint: http://localhost:${PORT}/api/v2/status`)
}

// Export the app instance for CMS integration
export { app }
