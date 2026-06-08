const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Request/response logging middleware
app.use((req, res, next) => {
  console.log("API GATEWAY HIT:", req.method, req.url);
  res.on('finish', () => {
    console.log(`API GATEWAY RESPONSE: ${req.method} ${req.url} -> ${res.statusCode}`);
  });
  next();
});

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
  })
);

app.use(
  "/api/leave",
  createProxyMiddleware({
    target: "http://localhost:3002",
    changeOrigin: true,
    pathRewrite: (path, req) => {
      return "/api/leave" + path;
    },
  })
);

app.listen(3000, () => {
  console.log("API Gateway running on port 3000");
});