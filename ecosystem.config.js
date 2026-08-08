// PM2 Ecosystem Config — Hostinger Unified Deployment
// The entire project (frontend + backend) runs as ONE Node.js app.
//
// Folder structure after deployment:
// /project-root/
// ├── backend/
// │   ├── server.js        ← Express server (entry point)
// │   ├── routes/
// │   ├── middleware/
// │   ├── utils/
// │   └── data/
// ├── dist/                ← Built React frontend (npm run build output)
// │   ├── index.html
// │   └── assets/
// ├── src/                 ← React source (not needed at runtime)
// ├── public/              ← Static assets (copied to dist/ at build time)
// ├── package.json         ← Root package.json (Vite + React deps)
// └── ecosystem.config.js  ← This file

module.exports = {
  apps: [
    {
      name: "cancer-herbalist",
      script: "./backend/server.js",  // Express serves both API + dist/
      cwd: "./",                      // Run from project root so dist/ path resolves correctly
      env: {
        NODE_ENV: "production",
        PORT: 5001,
        FRONTEND_URL: "https://cancerherbalist.com",
      },
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
    },
  ],
};
