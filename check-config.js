#!/usr/bin/env node

/**
 * Configuration Checker
 * Verifies all required environment variables before starting the server
 */

require('dotenv').config();
const fs = require('fs');

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

function checkEnvFile() {
    if (!fs.existsSync('.env')) {
        log('\n❌ ERROR: .env file not found!', 'red');
        log('\n📝 Please run setup first:', 'yellow');
        log('   - Double-click: setup.bat', 'yellow');
        log('   - Or run: npm run dev:local', 'yellow');
        return false;
    }
    log('✅ .env file found', 'green');
    return true;
}

function checkRequiredVars() {
    const required = [
        'DB_HOST',
        'DB_USER',
        'DB_NAME',
        'PORT',
        'JWT_SECRET'
    ];

    let allPresent = true;
    
    log('\n📋 Checking required environment variables:', 'blue');
    
    for (const varName of required) {
        if (process.env[varName]) {
            log(`  ✅ ${varName}: ${process.env[varName]}`, 'green');
        } else {
            log(`  ❌ ${varName}: MISSING!`, 'red');
            allPresent = false;
        }
    }

    return allPresent;
}

function checkDatabase() {
    const dbConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '(empty)',
        database: process.env.DB_NAME
    };

    log('\n💾 Database Configuration:', 'blue');
    log(`  Host: ${dbConfig.host}`, 'reset');
    log(`  User: ${dbConfig.user}`, 'reset');
    log(`  Password: ${dbConfig.password === '(empty)' ? '(empty)' : '********'}`, 'reset');
    log(`  Database: ${dbConfig.database}`, 'reset');
    
    return true;
}

function main() {
    console.clear();
    log('╔═══════════════════════════════════════════════╗', 'blue');
    log('║      🔍 CONFIGURATION CHECKER                  ║', 'blue');
    log('╚═══════════════════════════════════════════════╝', 'blue');

    const envFileExists = checkEnvFile();
    if (!envFileExists) {
        process.exit(1);
    }

    const varsPresent = checkRequiredVars();
    checkDatabase();

    log('\n' + '═'.repeat(50), 'blue');
    
    if (varsPresent) {
        log('\n✅ Configuration is valid!', 'green');
        log(`\n🚀 Environment: ${process.env.NODE_ENV || 'development'}`, 'blue');
        log(`📦 Ready to start server!`, 'green');
        return 0;
    } else {
        log('\n❌ Configuration has errors!', 'red');
        log('\n📝 Please fix the missing variables in your .env file', 'yellow');
        return 1;
    }
}

process.exit(main());
