module.exports = {
  apps: [
    {
      name: "aqua-contratos",
      script: "src/index.js",
      cwd: "./backend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
  ],
};
