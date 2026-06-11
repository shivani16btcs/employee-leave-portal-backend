import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

app.use((req, res, next) => {
  console.log("API GATEWAY HIT:", req.method, req.url);
  res.on("finish", () => {
    console.log(
      `API GATEWAY RESPONSE: ${req.method} ${req.url} -> ${res.statusCode}`
    );
  });
  next();
});

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://auth-service:3001",
    changeOrigin: true,
    pathRewrite: (path) => "/api/auth" + path,
  })
);

app.use(
  "/api/leave",
  createProxyMiddleware({
    target: "http://leave-service:3002",
    changeOrigin: true,
    pathRewrite: (path) => "/api/leave" + path,
  })
);

app.listen(3000, () => {
  console.log("API Gateway running on port 3000");
});