/**
 * Demonstration of different import methods for @modular/api
 * This file shows how to use the package after yarn build
 */

// ========================================
// METHOD 1: Import everything (for modules)
// ========================================
import * as ModularAPI from './index';

console.log('📦 Method 1: Import everything');
console.log('Available exports:', Object.keys(ModularAPI));

// Usage example
const clientConfig = ModularAPI.createExampleModuleConfig('demo-module', 'Demo Module');
console.log('✅ Created module config:', clientConfig.moduleId);

// ========================================
// METHOD 2: Specific imports (for modules)
// ========================================
import { 
  createModularClient, 
  ModularClient,
  ModuleConfig,
  createModularApp,
  startModularServer 
} from './index';

console.log('\n📦 Method 2: Specific imports');
console.log('✅ Imported client functions and types');

// ========================================
// METHOD 3: CMS Integration
// ========================================
import { ModularCMS, modularCMS } from './cms-integration';

console.log('\n📦 Method 3: CMS Integration');

// Example CMS usage
async function demonstrateCMSUsage() {
  const cms = new ModularCMS();
  
  console.log('🔧 CMS created');
  console.log('📊 Server running?', cms.isServerRunning());
  
  // Get initial stats
  const stats = cms.getServerStats();
  console.log('📈 Initial stats:', stats);
  
  // Set up event handlers
  cms.onModuleEvent('module.registered', (data) => {
    console.log('🔔 Event: Module registered:', data.moduleId);
  });
  
  return cms;
}

// ========================================
// METHOD 4: Direct module client usage
// ========================================
async function demonstrateModuleUsage() {
  const moduleConfig: ModuleConfig = {
    moduleId: 'demo-app',
    moduleName: 'Demo Application',
    version: '1.0.0',
    capabilities: [
      { name: 'demo', description: 'Demo capability' }
    ],
    endpoints: [
      { path: '/demo', method: 'GET', description: 'Demo endpoint' }
    ]
  };
  
  console.log('\n📱 Method 4: Module client usage');
  
  // This would normally connect to a running server
  const client = createModularClient({
    apiUrl: 'http://localhost:7474/api/modular',
    moduleConfig
  });
  
  console.log('✅ Client created for module:', moduleConfig.moduleId);
  console.log('📋 Module config:', {
    id: moduleConfig.moduleId,
    name: moduleConfig.moduleName,
    capabilities: moduleConfig.capabilities.length,
    endpoints: moduleConfig.endpoints.length
  });
  
  return client;
}

// ========================================
// DEMONSTRATION RUNNER
// ========================================
async function runDemonstration() {
  console.log('🚀 ModulaR API Package Demonstration');
  console.log('=====================================\n');
  
  try {
    // Demonstrate CMS usage
    const cms = await demonstrateCMSUsage();
    
    // Demonstrate module usage
    const client = await demonstrateModuleUsage();
    
    console.log('\n✅ All demonstrations completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   - Package can be imported with: import * as ModularAPI from "@modular/api"');
    console.log('   - CMS integration: import { ModularCMS } from "@modular/api/cms"');
    console.log('   - Module client: import { createModularClient } from "@modular/api/client"');
    console.log('   - Types: import { ModuleConfig } from "@modular/api/types"');
    
    return { cms, client };
    
  } catch (error) {
    console.error('❌ Demonstration failed:', error);
    throw error;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runDemonstration()
    .then(() => {
      console.log('\n🎉 Demonstration completed!');
    })
    .catch((error) => {
      console.error('💥 Demonstration failed:', error);
      process.exit(1);
    });
}

export { runDemonstration };
