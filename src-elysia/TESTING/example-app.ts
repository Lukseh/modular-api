// This demonstrates how a CMS would use the unified ModulaR package
// CMS imports the same package but uses CMS.* functions

import { CMS, Types } from "../index"

// ========================================
// EXAMPLE CMS USAGE
// ========================================

class ModularCMS {
  private apiServer: any
  
  constructor() {
    console.log('🏗️ Initializing ModulaR CMS...')
  }
  
  // Start the CMS with integrated ModulaR API
  async start(port: number = 3000) {
    console.log('🚀 Starting CMS with ModulaR API integration...')
    
    // Create and start the API server with /api prefix
    this.apiServer = CMS.createAPIServer({ port, prefix: '/api' })
    
    // Set up module event handlers
    this.setupModuleMonitoring()
    
    console.log(`✅ CMS running with ModulaR API at http://localhost:${port}`)
    console.log(`📚 API Documentation: http://localhost:${port}/api/swagger`)
    console.log(`🔗 V1 Registration: POST http://localhost:${port}/api/v1/register`)
    console.log(`🔮 V2 Status: GET http://localhost:${port}/api/v2/status`)
    console.log(`📊 V1 Health: GET http://localhost:${port}/api/v1/health`)
    
    return this.apiServer
  }
  
  // CMS-specific module management
  setupModuleMonitoring() {
    // Monitor module registrations
    CMS.onModuleEvent('module.registered', (data) => {
      console.log(`🎉 CMS: New module connected - ${data.moduleId}`)
      this.handleNewModule(data)
    })
    
    // Periodic health check
    setInterval(() => {
      this.performHealthCheck()
    }, 30000) // Every 30 seconds for demo
  }
  
  // Handle new module registration
  private handleNewModule(moduleData: any) {
    console.log(`📋 CMS: Processing new module - ${moduleData.moduleId}`)
  }
  
  // Periodic health monitoring
  private performHealthCheck() {
    const health = CMS.getSystemHealth()
    const modules = CMS.getRegisteredModules()
    
    console.log(`📊 CMS Health Check:`, {
      status: health.status,
      totalModules: modules.length,
      activeModules: health.modules?.active || 0,
      uptime: Math.floor(health.uptime / 60) + ' minutes'
    })
  }
  
  // CMS Dashboard Data
  getDashboardData() {
    const modules = CMS.getRegisteredModules()
    const health = CMS.getSystemHealth()
    const moduleHealth = CMS.getModuleHealth()
    
    return {
      system: {
        status: health.status,
        uptime: health.uptime,
        timestamp: health.timestamp
      },
      modules: {
        total: modules.length,
        active: health.modules?.active || 0,
        inactive: health.modules?.inactive || 0,
        list: modules.map(m => ({
          id: m.moduleId,
          name: m.moduleName,
          version: m.version,
          capabilities: m.capabilities.length,
          endpoints: m.endpoints.length
        }))
      }
    }
  }
  
  // Send commands to modules
  async deployToModule(moduleId: string, deployConfig: any) {
    console.log(`🚀 CMS: Deploying to module ${moduleId}`)
    
    try {
      const result = await CMS.sendCommandToModule(moduleId, 'deploy', deployConfig)
      console.log(`✅ Deployment successful:`, result)
      return result
    } catch (error) {
      console.error(`❌ Deployment failed:`, error)
      throw error
    }
  }
  
  // Broadcast system updates
  async broadcastUpdate(message: string, data?: any) {
    console.log(`📢 CMS: Broadcasting system update: ${message}`)
    
    try {
      const result = await CMS.broadcastToAllModules('system.update', {
        message,
        data,
        timestamp: new Date().toISOString()
      })
      console.log(`✅ Broadcast sent to ${result.sentTo?.length || 0} modules`)
      return result
    } catch (error) {
      console.error(`❌ Broadcast failed:`, error)
      throw error
    }
  }
}

// ========================================
// CMS DEMO
// ========================================

async function runCMSDemo() {
  const cms = new ModularCMS()
  
  try {
    // Start CMS
    await cms.start(3000)
    
    // Simulate CMS operations
    setTimeout(async () => {
      console.log('\n📊 CMS Dashboard Data:')
      const dashboard = cms.getDashboardData()
      console.log(JSON.stringify(dashboard, null, 2))
    }, 10000)
    
    // Simulate broadcast after 20 seconds
    setTimeout(async () => {
      console.log('\n📢 CMS: Simulating system broadcast...')
      await cms.broadcastUpdate('System maintenance scheduled for tonight')
    }, 20000)
    
    console.log('\n🎯 CMS Demo running...')
    console.log('Start some modules to see them connect!')
    console.log('Press Ctrl+C to shutdown CMS')
    
  } catch (error) {
    console.error('💥 Failed to start CMS:', error)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received shutdown signal...')
  process.exit(0)
})

// Run if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runCMSDemo()
}

export { ModularCMS }
