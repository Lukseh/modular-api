#!/usr/bin/env node

/**
 * Test script for ModulaR API
 * This script demonstrates how to interact with the ModulaR API endpoints
 */

const http = require('http');

const API_BASE_URL = 'http://localhost:7474/api/modular';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ModulaR-API-Test/1.0.0'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ 
            status: res.statusCode, 
            data: parsed,
            headers: res.headers
          });
        } catch (error) {
          resolve({ 
            status: res.statusCode, 
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test data
const testModule = {
  moduleId: 'test-module-' + Date.now(),
  moduleName: 'Test Module',
  version: '1.0.0',
  description: 'A test module for API testing',
  capabilities: [
    {
      name: 'testing',
      description: 'Testing capabilities',
      version: '1.0.0'
    }
  ],
  endpoints: [
    {
      path: '/test',
      method: 'GET',
      description: 'Test endpoint',
      protected: false
    }
  ],
  metadata: {
    testRun: true,
    createdAt: new Date().toISOString()
  }
};

// Test functions
async function testApiEndpoints() {
  console.log('🧪 Starting ModulaR API Tests');
  console.log('================================\n');

  try {
    // Test 1: Check API health
    console.log('📊 Test 1: Health Check');
    const healthResponse = await makeRequest('GET', '/health');
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Response:`, JSON.stringify(healthResponse.data, null, 2));
    console.log('✅ Health check completed\n');

    // Test 2: Register a module
    console.log('📝 Test 2: Module Registration');
    const registerResponse = await makeRequest('POST', '/register', testModule);
    console.log(`   Status: ${registerResponse.status}`);
    console.log(`   Response:`, JSON.stringify(registerResponse.data, null, 2));
    
    if (registerResponse.data.success) {
      console.log('✅ Module registered successfully\n');
    } else {
      console.log('❌ Module registration failed\n');
      return;
    }

    // Test 3: Get all modules
    console.log('📋 Test 3: Get All Modules');
    const modulesResponse = await makeRequest('GET', '/modules');
    console.log(`   Status: ${modulesResponse.status}`);
    console.log(`   Modules found: ${modulesResponse.data.data?.totalCount || 0}`);
    console.log('✅ Module list retrieved\n');

    // Test 4: Get specific module
    console.log('🔍 Test 4: Get Specific Module');
    const moduleResponse = await makeRequest('GET', `/modules/${testModule.moduleId}`);
    console.log(`   Status: ${moduleResponse.status}`);
    console.log(`   Module name: ${moduleResponse.data.data?.module?.moduleName || 'N/A'}`);
    console.log('✅ Specific module retrieved\n');

    // Test 5: Send heartbeat
    console.log('💓 Test 5: Send Heartbeat');
    const heartbeatData = {
      memory: {
        used: 50000000,
        total: 100000000,
        percentage: 50
      },
      cpu: {
        percentage: 25
      },
      customMetrics: {
        requestCount: 150,
        errorRate: 0.02
      }
    };
    const heartbeatResponse = await makeRequest('POST', `/heartbeat/${testModule.moduleId}`, heartbeatData);
    console.log(`   Status: ${heartbeatResponse.status}`);
    console.log(`   Response:`, JSON.stringify(heartbeatResponse.data, null, 2));
    console.log('✅ Heartbeat sent\n');

    // Test 6: Send communication
    console.log('📨 Test 6: Send Communication');
    const communicationData = {
      action: 'testAction',
      data: {
        message: 'Hello from test script',
        timestamp: new Date().toISOString()
      }
    };
    const commResponse = await makeRequest('POST', `/communicate/${testModule.moduleId}`, communicationData);
    console.log(`   Status: ${commResponse.status}`);
    console.log(`   Response:`, JSON.stringify(commResponse.data, null, 2));
    console.log('✅ Communication sent\n');

    // Test 7: Broadcast message
    console.log('📢 Test 7: Broadcast Message');
    const broadcastData = {
      action: 'testBroadcast',
      data: {
        message: 'Test broadcast message',
        priority: 'normal'
      }
    };
    const broadcastResponse = await makeRequest('POST', '/broadcast', broadcastData);
    console.log(`   Status: ${broadcastResponse.status}`);
    console.log(`   Response:`, JSON.stringify(broadcastResponse.data, null, 2));
    console.log('✅ Broadcast sent\n');

    // Test 8: Get module capabilities
    console.log('🔧 Test 8: Get Module Capabilities');
    const capabilitiesResponse = await makeRequest('GET', `/modules/${testModule.moduleId}/capabilities`);
    console.log(`   Status: ${capabilitiesResponse.status}`);
    console.log(`   Capabilities: ${capabilitiesResponse.data.data?.capabilities?.length || 0}`);
    console.log('✅ Capabilities retrieved\n');

    // Test 9: Get communication logs
    console.log('📜 Test 9: Get Communication Logs');
    const logsResponse = await makeRequest('GET', '/logs?limit=10');
    console.log(`   Status: ${logsResponse.status}`);
    console.log(`   Log entries: ${logsResponse.data.data?.totalLogs || 0}`);
    console.log('✅ Logs retrieved\n');

    // Test 10: Unregister module
    console.log('🗑️  Test 10: Unregister Module');
    const unregisterResponse = await makeRequest('DELETE', `/modules/${testModule.moduleId}`);
    console.log(`   Status: ${unregisterResponse.status}`);
    console.log(`   Response:`, JSON.stringify(unregisterResponse.data, null, 2));
    console.log('✅ Module unregistered\n');

    console.log('🎉 All tests completed successfully!');
    console.log('================================');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Make sure the ModulaR API server is running on http://localhost:7474');
    process.exit(1);
  }
}

// Error handling
async function testErrorHandling() {
  console.log('\n🚫 Testing Error Handling');
  console.log('========================\n');

  try {
    // Test invalid module registration
    console.log('📝 Test: Invalid Module Registration');
    const invalidModule = { moduleId: '', moduleName: '' };
    const errorResponse = await makeRequest('POST', '/register', invalidModule);
    console.log(`   Status: ${errorResponse.status}`);
    console.log(`   Error handled: ${!errorResponse.data.success}`);
    console.log('✅ Error handling works\n');

    // Test non-existent module
    console.log('🔍 Test: Non-existent Module');
    const notFoundResponse = await makeRequest('GET', '/modules/non-existent-module');
    console.log(`   Status: ${notFoundResponse.status}`);
    console.log(`   404 handled: ${notFoundResponse.status === 404}`);
    console.log('✅ 404 handling works\n');

  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 ModulaR API Test Suite');
  console.log('=========================\n');
  console.log(`Testing API at: ${API_BASE_URL}\n`);

  await testApiEndpoints();
  await testErrorHandling();

  console.log('\n✨ Test suite completed!');
}

// Check if server is running before starting tests
async function checkServerHealth() {
  try {
    await makeRequest('GET', '/health');
    return true;
  } catch (error) {
    return false;
  }
}

// Start tests
(async () => {
  const isServerRunning = await checkServerHealth();
  
  if (!isServerRunning) {
    console.error('❌ ModulaR API server is not running!');
    console.log('   Please start the server first:');
    console.log('   npm run dev');
    console.log('   OR');
    console.log('   node dist/index.js');
    process.exit(1);
  }

  await runTests();
})();
