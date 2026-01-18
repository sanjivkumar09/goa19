#!/usr/bin/env node

/**
 * Simple Deployment Script for Windows
 * Deploys code to Hostinger VPS
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    remoteHost: '93.127.167.248',
    remoteUser: 'root',
    remotePath: '/root',
    localPath: process.cwd(),
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function executeCommand(command, description, ignoreError = false) {
    log(`\n📦 ${description}...`, 'blue');
    try {
        execSync(command, { stdio: 'inherit' });
        log(`✅ ${description} completed!`, 'green');
        return true;
    } catch (error) {
        if (!ignoreError) {
            log(`❌ ${description} failed!`, 'red');
            log(error.message, 'red');
        }
        return false;
    }
}

function checkRsync() {
    try {
        execSync('rsync --version', { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

function deployWithSCP() {
    log('\n📦 Using SCP for deployment (slower but works everywhere)...', 'yellow');
    
    // Create a temporary zip file
    const zipFile = 'deploy-temp.zip';
    
    log('\n📦 Creating deployment package...', 'blue');
    try {
        // Create zip using PowerShell (works on Windows 10+)
        const powershellCmd = `powershell -Command "Get-ChildItem -Path '${CONFIG.localPath}' -Exclude node_modules,.git,*.log,.env | Compress-Archive -DestinationPath '${zipFile}' -Force"`;
        execSync(powershellCmd, { stdio: 'inherit' });
        log('✅ Package created!', 'green');
    } catch (error) {
        log('❌ Failed to create package', 'red');
        return false;
    }
    
    // Upload zip file
    const scpCommand = `scp "${zipFile}" ${CONFIG.remoteUser}@${CONFIG.remoteHost}:${CONFIG.remotePath}/`;
    if (!executeCommand(scpCommand, 'Uploading package to server')) {
        return false;
    }
    
    // Extract on server
    const extractCommand = `ssh ${CONFIG.remoteUser}@${CONFIG.remoteHost} "cd ${CONFIG.remotePath} && unzip -o ${zipFile} && rm ${zipFile}"`;
    const success = executeCommand(extractCommand, 'Extracting files on server');
    
    // Clean up local zip
    try {
        fs.unlinkSync(zipFile);
    } catch (e) {
        // Ignore
    }
    
    return success;
}

function deployWithRsync() {
    log('\n📦 Using rsync for fast deployment...', 'yellow');
    
    // Create exclude file
    const excludeFile = path.join(__dirname, '.rsync-exclude');
    const excludePatterns = [
        'node_modules/',
        '.git/',
        '.env.local',
        '.env',
        'deploy.js',
        '.rsync-exclude',
        '*.log',
        '*.bat',
        'README.md',
        'DEVELOPMENT_GUIDE.md',
        'QUICK_START.txt',
        'SIMPLE-INSTRUCTIONS.txt',
    ];
    
    fs.writeFileSync(excludeFile, excludePatterns.join('\n'));
    
    // Upload files using rsync
    const rsyncCommand = `rsync -avz --delete --exclude-from="${excludeFile}" -e "ssh" "${CONFIG.localPath}/" ${CONFIG.remoteUser}@${CONFIG.remoteHost}:${CONFIG.remotePath}/`;
    
    const success = executeCommand(rsyncCommand, 'Uploading files to server');
    
    // Clean up
    try {
        fs.unlinkSync(excludeFile);
    } catch (e) {
        // Ignore
    }
    
    return success;
}

function deployFiles() {
    const hasRsync = checkRsync();
    
    if (hasRsync) {
        return deployWithRsync();
    } else {
        log('\n⚠️  rsync not found. Using alternative method...', 'yellow');
        log('💡 Tip: Install Git Bash for Windows for faster deployments!', 'yellow');
        return deployWithSCP();
    }
}

function deployEnvironment() {
    const command = `ssh ${CONFIG.remoteUser}@${CONFIG.remoteHost} "cd ${CONFIG.remotePath} && cp .env.production .env"`;
    return executeCommand(command, 'Setting up production environment');
}

function restartServer() {
    const command = `ssh ${CONFIG.remoteUser}@${CONFIG.remoteHost} "cd ${CONFIG.remotePath} && pm2 restart game-server || pm2 start src/server.js --name game-server"`;
    return executeCommand(command, 'Restarting server');
}

function showStatus() {
    log('\n📊 Server Status:', 'blue');
    log('═══════════════════════════════════════════════\n', 'yellow');
    
    const command = `ssh ${CONFIG.remoteUser}@${CONFIG.remoteHost} "pm2 status"`;
    executeCommand(command, 'Fetching status', true);
}

function showLogs() {
    log('\n📋 Recent Server Logs:', 'blue');
    log('═══════════════════════════════════════════════\n', 'yellow');
    
    const command = `ssh ${CONFIG.remoteUser}@${CONFIG.remoteHost} "pm2 logs game-server --lines 15 --nostream"`;
    executeCommand(command, 'Fetching logs', true);
}

function main() {
    console.clear();
    log('╔═══════════════════════════════════════════════╗', 'green');
    log('║     🚀 HOSTINGER VPS DEPLOYMENT TOOL 🚀      ║', 'green');
    log('╚═══════════════════════════════════════════════╝', 'green');

    // Check SSH connection
    log('\n🔐 Checking SSH connection...', 'blue');
    try {
        execSync(`ssh -o ConnectTimeout=10 ${CONFIG.remoteUser}@${CONFIG.remoteHost} "echo 'Connection successful'"`, { stdio: 'ignore' });
        log('✅ SSH connection successful!', 'green');
    } catch (error) {
        log('❌ Cannot connect to server. Please check:', 'red');
        log('   - Your internet connection', 'yellow');
        log('   - SSH access to the server', 'yellow');
        log('   - Server IP address: ' + CONFIG.remoteHost, 'yellow');
        log('\n💡 Tip: Make sure you have SSH access configured!', 'yellow');
        process.exit(1);
    }

    // Deploy
    let success = true;
    
    success = deployFiles() && success;
    success = deployEnvironment() && success;
    success = restartServer() && success;

    if (success) {
        log('\n╔═══════════════════════════════════════════════╗', 'green');
        log('║      🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!     ║', 'green');
        log('╚═══════════════════════════════════════════════╝', 'green');
        
        log('\n🌐 Your app is now live at:', 'blue');
        log(`   http://${CONFIG.remoteHost}:3000`, 'green');
        
        showStatus();
        showLogs();
    } else {
        log('\n╔═══════════════════════════════════════════════╗', 'red');
        log('║         ⚠️  DEPLOYMENT INCOMPLETE!             ║', 'red');
        log('╚═══════════════════════════════════════════════╝', 'red');
        log('\nPlease check the errors above and try again.', 'yellow');
    }
}

// Run deployment
main();
