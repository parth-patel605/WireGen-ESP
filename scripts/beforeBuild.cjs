const { execSync } = require('child_process');

module.exports = async function(context) {
  console.log('🧹 beforeBuild hook running to kill any locking processes...');
  if (process.platform === 'win32') {
    try {
      execSync('taskkill /f /im electron.exe', { stdio: 'ignore' });
      console.log('✅ taskkill electron.exe succeeded.');
    } catch (e) {}
    try {
      execSync('taskkill /f /im "WireGen AI.exe"', { stdio: 'ignore' });
      console.log('✅ taskkill "WireGen AI.exe" succeeded.');
    } catch (e) {}
    
    // Give Windows some time to release file handles
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};
