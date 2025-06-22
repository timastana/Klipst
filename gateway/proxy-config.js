// Gateway proxy configuration
const { createProxyMiddleware } = require("http-proxy-middleware")

const proxyConfig = {
  "/landlord": {
    target: process.env.LANDLORD_FRONTEND_URL || "http://landlord-frontend:8180",
    changeOrigin: true,
    pathRewrite: {
      "^/landlord": "", // Remove /landlord prefix when forwarding
    },
    onError: (err, req, res) => {
      console.error("Proxy error:", err.message)
      res.status(503).json({
        error: "Service temporarily unavailable",
        message: "The landlord service is currently down. Please try again later.",
        timestamp: new Date().toISOString(),
      })
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying ${req.method} ${req.url} to ${proxyReq.path}`)
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`Response ${proxyRes.statusCode} for ${req.url}`)
    },
    // Retry configuration
    retry: {
      retries: 3,
      retryDelay: 1000,
    },
    // Timeout configuration
    timeout: 30000,
    proxyTimeout: 30000,
    // Keep connection alive
    keepAlive: true,
  },
}

module.exports = proxyConfig
