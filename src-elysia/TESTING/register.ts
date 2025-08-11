// This demonstrates how MODULES would use the unified ModulaR package
// Modules import the same package but use Module.* functions

import { Module, Types } from "../index"

// ========================================
// EXAMPLE MODULE USAGE
// ========================================

// Create module configuration
const blogModuleConfig: Types.ModuleConfig = Module.createConfig({
  moduleId: 'blog-module',
  moduleName: 'Blog Management Module',
  version: '1.2.0',
  description: 'Handles blog posts and comments',
  capabilities: [
    {
      name: 'content-management',
      description: 'Create and manage blog posts',
      version: '1.0.0'
    },
    {
      name: 'comment-system',
      description: 'Handle user comments'
    }
  ],
  endpoints: [
    {
      path: '/blog/posts',
      method: 'GET',
      description: 'Get all blog posts',
      protected: false
    },
    {
      path: '/blog/posts',
      method: 'POST',
      description: 'Create new blog post',
      protected: true
    },
    {
      path: '/blog/posts/:id',
      method: 'PUT',
      description: 'Update blog post',
      protected: true
    }
  ]
})

// Create modular client for this module
const blogClient = Module.createClient({
  apiUrl: 'http://localhost:3000/api/v1',
  moduleConfig: blogModuleConfig,
  heartbeatInterval: 25000 // 25 seconds
})

// ========================================
// MODULE ROUTE REGISTRATION
// ========================================

// Modules can register their routes using simple helpers
blogClient.routes.get('/blog/posts', () => {
  return { posts: ['Post 1', 'Post 2'] }
})

blogClient.routes.post('/blog/posts', (data: any) => {
  console.log('Creating new blog post:', data)
  return { success: true, postId: Date.now() }
})

blogClient.routes.put('/blog/posts/:id', (data: any) => {
  console.log('Updating blog post:', data)
  return { success: true }
})

// ========================================
// MODULE STARTUP SIMULATION
// ========================================

async function startBlogModule() {
  console.log('🚀 Starting Blog Module...')
  console.log('📋 Module Info:', {
    id: blogModuleConfig.moduleId,
    name: blogModuleConfig.moduleName,
    version: blogModuleConfig.version,
    endpoints: blogModuleConfig.endpoints.length,
    capabilities: blogModuleConfig.capabilities.length
  })
  
  try {
    // Register with CMS
    console.log('📝 Registering with ModulaR CMS...')
    const result = await blogClient.register()
    
    if (result.success) {
      console.log('✅ Successfully registered with CMS!')
      console.log('💓 Heartbeat started automatically')
      console.log('📱 Blog module is now active and managed by CMS')
      
      // Simulate some module activity
      setTimeout(() => {
        console.log('📊 Module is processing blog requests...')
      }, 5000)
      
    } else {
      console.error('❌ Registration failed:', result.error)
    }
    
  } catch (error) {
    console.error('💥 Failed to start module:', error)
  }
}

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Blog Module...')
  await blogClient.unregister()
  console.log('👋 Blog module disconnected from CMS')
  process.exit(0)
})

// ========================================
// DEMO: ANOTHER MODULE TYPE
// ========================================

const userModuleConfig: Types.ModuleConfig = Module.createConfig({
  moduleId: 'user-module',
  moduleName: 'User Management Module',
  version: '2.0.1',
  capabilities: [
    { name: 'user-authentication', description: 'Handle user login/logout' },
    { name: 'user-profiles', description: 'Manage user profiles' }
  ],
  endpoints: [
    { path: '/users/login', method: 'POST', description: 'User login' },
    { path: '/users/profile', method: 'GET', description: 'Get user profile', protected: true }
  ]
})

const userClient = Module.createClient({
  apiUrl: 'http://localhost:3000/api/v1',
  moduleConfig: userModuleConfig,
  heartbeatInterval: 30000
})

// Register user module routes
userClient.routes.post('/users/login', (credentials: any) => {
  console.log('User login attempt:', credentials.username)
  return { success: true, token: 'fake-jwt-token' }
})

userClient.routes.get('/users/profile', () => {
  return { user: { id: 1, name: 'John Doe', email: 'john@example.com' } }
})

// ========================================
// RUN SIMULATION
// ========================================

async function runModuleDemo() {
  console.log('🎯 ModulaR Module Integration Demo')
  console.log('=================================')
  
  // Start blog module
  await startBlogModule()
  
  // Start user module after 3 seconds
  setTimeout(async () => {
    console.log('\n🔄 Starting User Module...')
    const userResult = await userClient.register()
    if (userResult.success) {
      console.log('✅ User module also registered!')
    }
  }, 3000)
  
  // Stop demo after 30 seconds
  setTimeout(() => {
    console.log('\n🏁 Demo completed - modules will continue running')
    console.log('Press Ctrl+C to stop all modules')
  }, 30000)
}

// Run if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runModuleDemo()
}

export { startBlogModule, blogClient, userClient }
