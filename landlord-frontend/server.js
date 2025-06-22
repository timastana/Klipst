// Custom server for landlord-frontend with health check
const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")

const dev = process.env.NODE_ENV !== "production"
const hostname = process.env.HOSTNAME || "localhost"
const port = Number.parseInt(process.env.PORT, 10) || 8180

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      const { pathname } = parsedUrl

      // Health check endpoint
      if (pathname === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            status: "healthy",
            timestamp: new Date().toISOString(),
            service: "landlord-frontend",
          }),
        )
        return
      }

      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error("Error occurred handling", req.url, err)
      res.statusCode = 500
      res.end("Internal Server Error")
    }
  })
    .once("error", (err) => {
      console.error("Server error:", err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Landlord Frontend ready on http://${hostname}:${port}`)
    })
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully")
  process.exit(0)
})
