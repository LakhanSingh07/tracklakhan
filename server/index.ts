import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { loadEnvFile } from "node:process";

try {
  loadEnvFile(".env");
} catch {
  // Local .env is optional; deployed environments can provide variables directly.
}

process.env.NODE_ENV = process.env.NODE_ENV || "development";

const app = express();
const httpServer = createServer(app)

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (req.method === "POST" && req.body) {
        logLine += ` :: Req: ${JSON.stringify(req.body)}`;
      }
      if (capturedJsonResponse) {
        logLine += ` :: Res: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  const listenOptions =
    process.platform === "win32"
      ? { port, host: "0.0.0.0" }
      : { port, host: "0.0.0.0", reusePort: true };

  httpServer.listen(
    listenOptions,
    () => {
      log(`serving on port ${port}`);
    },
  );

  // Start a redirect helper on port 3000 to catch Supabase auth callbacks and redirect to 5000
  try {
    const redirectApp = express();
    redirectApp.use((req, res) => {
      res.send(`
        <html>
          <head><title>Redirecting to port 5000...</title></head>
          <body>
            <p>Redirecting to FlowAI application on port 5000...</p>
            <script>
              window.location.href = window.location.href.replace(":3000", ":5000");
            </script>
          </body>
        </html>
      `);
    });
    const redirectServer = redirectApp.listen(3000, "0.0.0.0", () => {
      log("Auth redirect helper listening on port 3000");
    });
    redirectServer.on("error", (err: any) => {
      log(`Auth redirect helper failed to start: ${err.message}`);
    });
  } catch (err: any) {
    log(`Auth redirect helper error: ${err.message}`);
  }
})();
