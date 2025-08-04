#!/usr/bin/env node

/**
 * Quick start script for ModulaR API
 * This script helps users get started with the ModulaR API package
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 ModulaR API Quick Start');
console.log('==========================\n');

// Check if TypeScript is compiled
const distExists = fs.existsSync('./dist');
if (!distExists) {
  console.log('📦 Compiling TypeScript...');
  const tscProcess = spawn('npx', ['tsc'], { stdio: 'inherit', shell: true });
  
  tscProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ TypeScript compilation completed\n');
      startDemo();
    } else {
      console.error('❌ TypeScript compilation failed');
      process.exit(1);
    }
  });
} else {
  startDemo();
}

function startDemo() {
  console.log('🎯 Choose what you want to run:\n');
  console.log('1. Start ModulaR API Server');
  console.log('2. Run Example Module');
  console.log('3. Run API Tests');
  console.log('4. Show Usage Examples');
  console.log('5. Exit\n');

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter your choice (1-5): ', (choice) => {
    rl.close();
    
    switch (choice.trim()) {
      case '1':
        startApiServer();
        break;
      case '2':
        runExampleModule();
        break;
      case '3':
        runApiTests();
        break;
      case '4':
        showUsageExamples();
        break;
      case '5':
        console.log('👋 Goodbye!');
        process.exit(0);
        break;
      default:
        console.log('❌ Invalid choice. Please run the script again.');
        process.exit(1);
    }
  });
}

function startApiServer() {
  console.log('🚀 Starting ModulaR API Server...\n');
  console.log('   The server will start on http://localhost:7474');
  console.log('   API endpoints will be available at http://localhost:7474/api/modular');
  console.log('   Press Ctrl+C to stop the server\n');
  
  const serverProcess = spawn('node', ['dist/index.js'], { 
    stdio: 'inherit', 
    shell: true 
  });
  
  serverProcess.on('error', (error) => {
    console.error('❌ Failed to start server:', error.message);
  });
}

function runExampleModule() {
  console.log('🎯 Starting Example Module...\n');
  console.log('   Make sure the ModulaR API Server is running first!');
  console.log('   The example module will start on http://localhost:3001');
  console.log('   It will automatically register with the API server\n');
  
  const moduleProcess = spawn('node', ['dist/examples/exampleModule.js'], { 
    stdio: 'inherit', 
    shell: true,
    env: { ...process.env, MODULE_PORT: '3001' }
  });
  
  moduleProcess.on('error', (error) => {
    console.error('❌ Failed to start example module:', error.message);
  });
}

function runApiTests() {
  console.log('🧪 Running API Tests...\n');
  console.log('   Make sure the ModulaR API Server is running first!\n');
  
  const testProcess = spawn('node', ['src/test-api.js'], { 
    stdio: 'inherit', 
    shell: true 
  });
  
  testProcess.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ All tests passed!');
    } else {
      console.log('\n❌ Some tests failed');
    }
  });
  
  testProcess.on('error', (error) => {
    console.error('❌ Failed to run tests:', error.message);
  });
}

function showUsageExamples() {
  console.log(`
📖 ModulaR API Usage Examples
=============================

1. 🔧 Basic Module Setup:
   \`\`\`javascript
   import { createModularClient } from '@modular/api';
   
   const client = createModularClient({
     apiUrl: 'http://localhost:7474/api/modular',
     moduleConfig: {
       moduleId: 'my-module',
       moduleName: 'My Module',
       version: '1.0.0',
       capabilities: [],
       endpoints: []
     }
   });
   
   await client.register();
   \`\`\`

2. 📡 API Endpoints:
   - Register Module: POST /api/modular/register
   - Get Modules: GET /api/modular/modules
   - Send Heartbeat: POST /api/modular/heartbeat/:moduleId
   - Communicate: POST /api/modular/communicate/:moduleId
   - Health Check: GET /api/modular/health

3. 🧪 Test Commands:
   - npm run build      # Compile TypeScript
   - npm run start      # Start API server
   - npm run example    # Run example module
   - node src/test-api.js  # Run API tests

4. 🚀 Quick Start:
   Terminal 1: npm run start    # Start API server
   Terminal 2: npm run example  # Start example module
   Terminal 3: node src/test-api.js  # Run tests

5. 📚 Documentation:
   - Full documentation: src/README.md
   - Type definitions: src/types/modular.ts
   - Example implementation: src/examples/exampleModule.ts

6. 🔮 Future Integration with @modular/RobusT:
   \`\`\`javascript
   import { robust } from '@modular/robust';
   
   app.get('/secure-data', 
     robust.protect({ level: 'high' }),
     (req, res) => {
       res.json(robust.encrypt(sensitiveData));
     }
   );
   \`\`\`

Happy coding! 🎉
`);
}
