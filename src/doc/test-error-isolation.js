/**
 * Test script to verify that documentation errors don't affect the main application
 * 
 * This script temporarily introduces errors in documentation files and verifies
 * that the application continues to work normally.
 */

const fs = require('fs');
const path = require('path');

// Backup and restore utilities
function backupFile(filePath) {
  const backupPath = filePath + '.backup';
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, backupPath);
    console.log(`✅ Backed up: ${filePath}`);
    return true;
  }
  return false;
}

function restoreFile(filePath) {
  const backupPath = filePath + '.backup';
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, filePath);
    fs.unlinkSync(backupPath);
    console.log(`✅ Restored: ${filePath}`);
    return true;
  }
  return false;
}

function introduceError(filePath, errorType = 'syntax') {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  switch (errorType) {
    case 'syntax':
      // Introduce syntax error
      content = content.replace('export const', 'export const BROKEN_SYNTAX {{{');
      break;
    case 'missing-import':
      // Add invalid import
      content = 'import { NonExistentModule } from "non-existent-module";\n' + content;
      break;
    case 'runtime':
      // Add runtime error
      content = content.replace('export const', 'throw new Error("Documentation error"); export const');
      break;
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`💥 Introduced ${errorType} error in: ${filePath}`);
  return true;
}

// Test scenarios
const testFiles = [
  path.join(__dirname, 'auth/auth.swagger.ts'),
  path.join(__dirname, 'users/users.swagger.ts'),
  path.join(__dirname, 'inventory/inventory.swagger.ts')
];

async function runErrorIsolationTest() {
  console.log('🧪 Starting Documentation Error Isolation Test\n');
  
  const backedUpFiles = [];
  
  try {
    // Step 1: Backup original files
    console.log('📦 Step 1: Backing up documentation files...');
    for (const file of testFiles) {
      if (backupFile(file)) {
        backedUpFiles.push(file);
      }
    }
    
    // Step 2: Introduce errors
    console.log('\n💥 Step 2: Introducing documentation errors...');
    introduceError(testFiles[0], 'syntax');
    introduceError(testFiles[1], 'missing-import');
    introduceError(testFiles[2], 'runtime');
    
    console.log('\n⚠️  Documentation files now contain errors!');
    console.log('🚀 Now start the application with: npm run start:dev');
    console.log('📋 Verify that:');
    console.log('   - Application starts successfully');
    console.log('   - API endpoints work normally');
    console.log('   - Error logs show documentation failures');
    console.log('   - Core functionality is unaffected');
    
    console.log('\n⏳ Press any key to restore files and cleanup...');
    
    // Wait for user input (in a real test, this would be automated)
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', () => {
      // Step 3: Restore files
      console.log('\n🔄 Step 3: Restoring original files...');
      for (const file of backedUpFiles) {
        restoreFile(file);
      }
      
      console.log('\n✅ Error isolation test completed!');
      console.log('📝 Documentation files have been restored to original state.');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Cleanup on error
    console.log('🔄 Cleaning up...');
    for (const file of backedUpFiles) {
      restoreFile(file);
    }
    
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  runErrorIsolationTest();
}

module.exports = {
  backupFile,
  restoreFile,
  introduceError,
  runErrorIsolationTest
};