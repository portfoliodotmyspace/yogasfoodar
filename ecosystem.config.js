module.exports = {
  apps: [
    {
      name: "yogasfood-backend",
      script: "server.js",
      instances: 1, // or 1 if you don’t want clustering
      exec_mode: "fork", // "fork" for single instance
      watch: false, // true in dev, false in prod
      env: {
        NODE_ENV: "development",
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 8080,
      },
    },
  ],
};
