// ──────────────────────────────────────────────────────────────
// Hostinger Entry Point (start.cjs)
// Runs BEFORE starting the Express server:
//   1. Installs backend dependencies (if missing)
//   2. Builds the React frontend → dist/
//   3. Starts Express (serves API + dist/)
// ──────────────────────────────────────────────────────────────

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const rootDir    = __dirname;                        // /project-root/
const backendDir = path.join(rootDir, 'backend');   // /project-root/backend/
const distDir    = path.join(rootDir, 'dist');      // /project-root/dist/

// ── Step 1: Install backend dependencies ───────────────────────
const backendModules = path.join(backendDir, 'node_modules');
if (!fs.existsSync(backendModules)) {
  console.log('📦 Installing backend dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: backendDir });
  console.log('✅ Backend dependencies installed');
}

// ── Step 2: Build React frontend ───────────────────────────────
if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  console.log('🔨 Building React frontend (this may take ~30s)...');
  execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
  console.log('✅ React frontend built → dist/');
} else {
  console.log('✅ dist/ already exists, skipping build');
}

// ── Step 3: Start Express backend ──────────────────────────────
console.log('🚀 Starting Express server...');
require('./backend/server.js');
