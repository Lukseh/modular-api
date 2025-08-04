"use strict";
/**
 * Demonstration of different import methods for @modular/api
 * This file shows how to use the package after yarn build
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDemonstration = runDemonstration;
// ========================================
// METHOD 1: Import everything (for modules)
// ========================================
const ModularAPI = __importStar(require("./index"));
console.log('📦 Method 1: Import everything');
console.log('Available exports:', Object.keys(ModularAPI));
// Usage example
const clientConfig = ModularAPI.createExampleModuleConfig('demo-module', 'Demo Module');
console.log('✅ Created module config:', clientConfig.moduleId);
// ========================================
// METHOD 2: Specific imports (for modules)
// ========================================
const index_1 = require("./index");
console.log('\n📦 Method 2: Specific imports');
console.log('✅ Imported client functions and types');
// ========================================
// METHOD 3: CMS Integration
// ========================================
const cms_integration_1 = require("./cms-integration");
console.log('\n📦 Method 3: CMS Integration');
// Example CMS usage
async function demonstrateCMSUsage() {
    const cms = new cms_integration_1.ModularCMS();
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
    const moduleConfig = {
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
    const client = (0, index_1.createModularClient)({
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
    }
    catch (error) {
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
//# sourceMappingURL=demo-imports.js.map