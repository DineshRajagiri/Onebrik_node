#!/usr/bin/env node

// Set memory limits before requiring anything else
process.env.NODE_OPTIONS = '--max-old-space-size=8192 --optimize-for-size --gc-interval=100';

// Force garbage collection more frequently
if (global.gc) {
  setInterval(() => {
    global.gc();
  }, 30000); // Every 30 seconds
}

// Start the NestJS application
const { spawn } = require('child_process');

const child = spawn('npx', ['nest', 'start', '--watch'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=8192 --optimize-for-size --gc-interval=100 --expose-gc',
    TS_NODE_TRANSPILE_ONLY: 'true',
    TS_NODE_FILES: 'true'
  }
});

child.on('exit', (code) => {
  process.exit(code);
});