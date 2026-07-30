// PM2 Ecosystem Config — used by Hostinger VPS after GitHub deploy
// Run with: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: "herbalist-backend",
      script: "./backend/server.js",
      cwd: "./",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      // Auto-restart on crash
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
    },
  ],
};
