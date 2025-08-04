#!/usr/bin/env node

/**
 * Standalone server entry point for ModulaR API
 * This file is used when running the server independently
 */

import { startModularServer } from './index';

const port = parseInt(process.env.PORT || '7474', 10);

// Start the server
startModularServer(port)
  .then((server) => {
    console.log(`\n📖 For complete documentation, see src/README.md`);
    
    // Handle graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
      
      server.close(() => {
        console.log('✅ ModulaR API Server closed');
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.log('❌ Forcing server shutdown');
        process.exit(1);
      }, 10000);
    };
    
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  })
  .catch((error) => {
    console.error('❌ Failed to start ModulaR API Server:', error);
    process.exit(1);
  });
