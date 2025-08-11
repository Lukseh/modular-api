// Service layer for ModulaR CMS API
// Handles module registration, communication, and management logic

import type { ModulaR } from './model'

// In-memory storage (in production, this would be a database)
interface ModuleRegistry {
  modules: Map<string, ModulaR.ModuleConfig>
  heartbeats: Map<string, { lastSeen: Date; status: string }>
  communications: Array<{
    timestamp: Date
    fromModule?: string
    toModule?: string
    action: string
    data: any
  }>
}

class ModularService {
  private registry: ModuleRegistry

  constructor() {
    this.registry = {
      modules: new Map(),
      heartbeats: new Map(),
      communications: []
    }
  }

  // Module registration
  async registerModule(config: ModulaR.ModuleConfig): Promise<ModulaR.RegistrationResponse> {
    const { moduleId } = config
    
    // Validate module config
    if (this.registry.modules.has(moduleId)) {
      throw new Error(`Module ${moduleId} is already registered`)
    }

    // Store module
    this.registry.modules.set(moduleId, config)
    this.registry.heartbeats.set(moduleId, {
      lastSeen: new Date(),
      status: 'active'
    })

    // Log registration
    this.logCommunication({
      timestamp: new Date(),
      toModule: moduleId,
      action: 'register',
      data: { moduleName: config.moduleName, version: config.version }
    })

    console.log(`📝 Module registered: ${moduleId} (${config.moduleName})`)

    return {
      success: true,
      message: 'Module registered successfully',
      moduleId,
      registeredAt: new Date().toISOString()
    }
  }

  // Module unregistration
  async unregisterModule(moduleId: string): Promise<{ success: boolean; message: string }> {
    if (!this.registry.modules.has(moduleId)) {
      throw new Error(`Module ${moduleId} not found`)
    }

    // Remove module
    this.registry.modules.delete(moduleId)
    this.registry.heartbeats.delete(moduleId)

    // Log unregistration
    this.logCommunication({
      timestamp: new Date(),
      fromModule: moduleId,
      action: 'unregister',
      data: {}
    })

    console.log(`🗑️ Module unregistered: ${moduleId}`)

    return {
      success: true,
      message: 'Module unregistered successfully'
    }
  }

  // Get all modules
  getModules(): ModulaR.ModuleConfig[] {
    return Array.from(this.registry.modules.values())
  }

  // Get specific module
  getModule(moduleId: string): ModulaR.ModuleConfig | null {
    return this.registry.modules.get(moduleId) || null
  }

  // Handle heartbeat
  async processHeartbeat(moduleId: string, payload?: ModulaR.HeartbeatPayload): Promise<{ success: boolean }> {
    if (!this.registry.modules.has(moduleId)) {
      throw new Error(`Module ${moduleId} not registered`)
    }

    // Update heartbeat
    this.registry.heartbeats.set(moduleId, {
      lastSeen: new Date(),
      status: payload?.status || 'active'
    })

    console.log(`💓 Heartbeat received from: ${moduleId}`)

    return { success: true }
  }

  // Send communication to module
  async sendCommunication(moduleId: string, action: string, data: any): Promise<{ success: boolean }> {
    if (!this.registry.modules.has(moduleId)) {
      throw new Error(`Module ${moduleId} not registered`)
    }

    // Log communication
    this.logCommunication({
      timestamp: new Date(),
      toModule: moduleId,
      action,
      data
    })

    console.log(`📨 Communication sent to ${moduleId}: ${action}`)

    // In real implementation, this would forward to the actual module
    // For now, just return success
    return { success: true }
  }

  // Broadcast to all modules
  async broadcastCommunication(action: string, data: any): Promise<{ success: boolean; sentTo: string[] }> {
    const moduleIds = Array.from(this.registry.modules.keys())

    // Log broadcast
    this.logCommunication({
      timestamp: new Date(),
      action: `broadcast:${action}`,
      data: { ...data, recipients: moduleIds }
    })

    console.log(`📢 Broadcasting ${action} to ${moduleIds.length} modules`)

    return {
      success: true,
      sentTo: moduleIds
    }
  }

  // Get system health
  getSystemHealth(): ModulaR.HealthResponse {
    const now = new Date()
    const activeModules = Array.from(this.registry.heartbeats.entries())
      .filter(([_, heartbeat]) => {
        const timeDiff = now.getTime() - heartbeat.lastSeen.getTime()
        return timeDiff < 60000 // Active if heartbeat within last minute
      })

    return {
      status: 'healthy',
      timestamp: now.toISOString(),
      uptime: process.uptime(),
      modules: {
        total: this.registry.modules.size,
        active: activeModules.length,
        inactive: this.registry.modules.size - activeModules.length
      }
    }
  }

  // Get module health status
  getModuleHealth(): Array<{
    moduleId: string
    status: string
    lastHeartbeat: string
    uptime: number
  }> {
    const now = new Date()
    
    return Array.from(this.registry.heartbeats.entries()).map(([moduleId, heartbeat]) => {
      const timeDiff = now.getTime() - heartbeat.lastSeen.getTime()
      
      return {
        moduleId,
        status: timeDiff < 60000 ? 'active' : 'inactive',
        lastHeartbeat: heartbeat.lastSeen.toISOString(),
        uptime: Math.floor(timeDiff / 1000)
      }
    })
  }

  // Get communication logs
  getCommunicationLogs(limit: number = 100) {
    return this.registry.communications
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  // Get module capabilities
  getModuleCapabilities(moduleId: string) {
    const module = this.registry.modules.get(moduleId)
    return module ? module.capabilities : null
  }

  // Get module endpoints
  getModuleEndpoints(moduleId: string) {
    const module = this.registry.modules.get(moduleId)
    return module ? module.endpoints : null
  }

  // Private helper to log communications
  private logCommunication(log: {
    timestamp: Date
    fromModule?: string
    toModule?: string
    action: string
    data: any
  }) {
    this.registry.communications.push(log)
    
    // Keep only last 1000 logs
    if (this.registry.communications.length > 1000) {
      this.registry.communications = this.registry.communications.slice(-1000)
    }
  }

  // Clean up inactive modules (would run periodically)
  cleanupInactiveModules(timeoutMs: number = 300000) { // 5 minutes
    const now = new Date()
    const toRemove: string[] = []

    this.registry.heartbeats.forEach((heartbeat, moduleId) => {
      const timeDiff = now.getTime() - heartbeat.lastSeen.getTime()
      if (timeDiff > timeoutMs) {
        toRemove.push(moduleId)
      }
    })

    toRemove.forEach(moduleId => {
      console.log(`🧹 Cleaning up inactive module: ${moduleId}`)
      this.registry.modules.delete(moduleId)
      this.registry.heartbeats.delete(moduleId)
    })

    return toRemove.length
  }
}

// Export singleton instance
export const modularService = new ModularService()

// Start cleanup task
setInterval(() => {
  modularService.cleanupInactiveModules()
}, 60000) // Run every minute
