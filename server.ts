/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { mockMovies } from "./src/data/movies";

const mockUsers = [
  { email: "netflix@netflix.com", password: "password123" },
  { email: "user@example.com", password: "netflix2026" },
  { email: "admin@netflix.com", password: "admin123" }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON request bodies
  app.use(express.json());

  // API Route: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API Route: Authentication
  app.post("/api/login", (req: express.Request, res: express.Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if the user exists
    const userExists = mockUsers.find(u => u.email === trimmedEmail);
    if (!userExists) {
      res.status(404).json({
        error: "Sorry, we can't find an account with this email address. Please try again or try 'netflix@netflix.com'.",
        code: "USER_NOT_FOUND"
      });
      return;
    }

    // Check if password matches
    if (userExists.password !== password) {
      res.status(401).json({
        error: "Incorrect password. Please try again. (Hint: the password for " + trimmedEmail + " is " + userExists.password + ")",
        code: "INCORRECT_PASSWORD"
      });
      return;
    }

    // Success
    res.json({
      success: true,
      user: {
        email: userExists.email,
        token: `mock_jwt_token_${Buffer.from(userExists.email).toString("base64")}`
      }
    });
  });

  // API Route: Get movies
  app.get("/api/movies", (req, res) => {
    res.json(mockMovies);
  });

  // Integrate Vite for Frontend rendering
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
});
