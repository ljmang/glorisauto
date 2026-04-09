const node20Bin = "/root/.nvm/versions/node/v20.19.4/bin/node";

module.exports = {
  apps: [
    {
      name: "glorisauto-www",
      cwd: "/srv/glorisauto.com/www",
      script: node20Bin,
      args: "./dist/server/entry.mjs",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: "4321",
        STRAPI_INTERNAL_URL: "http://127.0.0.1:1337",
        STRAPI_CACHE_TTL_MS: "60000"
      }
    }
  ]
};
