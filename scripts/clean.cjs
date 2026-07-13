const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Starting cleanup process...');

// 1. Force kill any running processes that could lock folders
if (process.platform === 'win32') {
  try {
    console.log('Closing any running Electron instances...');
    execSync('taskkill /f /im electron.exe', { stdio: 'ignore' });
  } catch (e) {}
  try {
    execSync('taskkill /f /im "WireGen AI.exe"', { stdio: 'ignore' });
  } catch (e) {}
}

// 2. Remove directories
const dirs = ['dist', 'dist-electron', 'release'];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Successfully deleted ${dir} folder.`);
    } catch (err) {
      console.error(`❌ Failed to delete ${dir} folder: ${err.message}`);
      console.log('Attempting alternative delete method...');
      try {
        // Fallback for Windows cmd force delete
        execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'ignore' });
        console.log(`✅ Successfully deleted ${dir} via rmdir shell.`);
      } catch (e) {
        console.error(`❌ Alternative delete failed: ${e.message}`);
      }
    }
  } else {
    console.log(`ℹ️ ${dir} folder does not exist. Skipping.`);
  }
});

console.log('🧹 Cleanup complete!');
