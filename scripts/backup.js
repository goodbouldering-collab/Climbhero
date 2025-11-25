#!/usr/bin/env node

/**
 * Automated Backup Script
 * Creates timestamped backups of critical project files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Files to backup
const BACKUP_FILES = [
  'seed_real_videos.sql',
  'seed_news_mock.sql',
  'wrangler.jsonc',
  'package.json',
  'ecosystem.config.cjs',
  '.gitignore'
];

// Directories to backup
const BACKUP_DIRS = [
  'migrations',
  'public/static',
  'src'
];

function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').split('.')[0];
}

function ensureBackupDir() {
  const backupDir = path.join(projectRoot, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
}

function createBackupManifest(backupDir, files) {
  const manifest = {
    timestamp: new Date().toISOString(),
    files: files,
    project: 'ClimbHero',
    version: process.env.npm_package_version || '1.0.0'
  };
  
  fs.writeFileSync(
    path.join(backupDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
}

async function main() {
  console.log('\n🔄 Creating automated backup...\n');
  
  const timestamp = getTimestamp();
  const backupRoot = ensureBackupDir();
  const backupDir = path.join(backupRoot, `backup-${timestamp}`);
  
  try {
    fs.mkdirSync(backupDir, { recursive: true });
    
    const backedUpFiles = [];
    
    // Backup individual files
    console.log('📄 Backing up files:');
    for (const file of BACKUP_FILES) {
      const srcPath = path.join(projectRoot, file);
      if (fs.existsSync(srcPath)) {
        const destPath = path.join(backupDir, file);
        fs.copyFileSync(srcPath, destPath);
        console.log(`  ✅ ${file}`);
        backedUpFiles.push(file);
      } else {
        console.log(`  ⚠️  ${file} (not found)`);
      }
    }
    
    // Backup directories
    console.log('\n📁 Backing up directories:');
    for (const dir of BACKUP_DIRS) {
      const srcPath = path.join(projectRoot, dir);
      if (fs.existsSync(srcPath)) {
        const destPath = path.join(backupDir, dir);
        fs.cpSync(srcPath, destPath, { recursive: true });
        console.log(`  ✅ ${dir}/`);
        backedUpFiles.push(dir);
      } else {
        console.log(`  ⚠️  ${dir}/ (not found)`);
      }
    }
    
    // Create manifest
    createBackupManifest(backupDir, backedUpFiles);
    console.log('\n📋 Backup manifest created');
    
    // Keep only last 10 backups
    const backups = fs.readdirSync(backupRoot)
      .filter(f => f.startsWith('backup-'))
      .sort()
      .reverse();
    
    if (backups.length > 10) {
      console.log('\n🧹 Cleaning old backups...');
      backups.slice(10).forEach(old => {
        const oldPath = path.join(backupRoot, old);
        fs.rmSync(oldPath, { recursive: true, force: true });
        console.log(`  🗑️  Removed ${old}`);
      });
    }
    
    console.log(`\n✅ Backup created: backups/backup-${timestamp}/`);
    console.log('📦 Total files backed up:', backedUpFiles.length);
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Backup failed:', error.message);
    process.exit(1);
  }
}

main();
