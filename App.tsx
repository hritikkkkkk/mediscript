import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import admin from "firebase-admin";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
// In this environment, we can usually find the config in firebase-applet-config.json
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
let firebaseConfig = {};
if (fs.existsSync(configPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: (firebaseConfig as any).projectId,
  });
}

const db = admin.firestore();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_for_demo_purposes";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- Auth API ---

  // Register (Mostly for doctors in this demo)
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, role, name, patientId } = req.body;

    try {
      if (!email || !password || !role) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const userRef = db.collection("users").doc(email);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await userRef.set({
        email,
        passwordHash: hashedPassword,
        role, // 'doctor' or 'patient'
        name,
        patientId: patientId || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    try {
      const userRef = db.collection("users").doc(email);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const userData = userDoc.data();
      const isPasswordValid = await bcrypt.compare(password, userData?.passwordHash);

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { 
          email: userData?.email, 
          role: userData?.role,
          name: userData?.name,
          patientId: userData?.patientId 
        }, 
        JWT_SECRET, 
        { expiresIn: "24h" }
      );

      // ADDED: Create Firebase Custom Token
      // Use email as UID to match doctor_id/patient_id in Firestore
      const firebaseToken = await admin.auth().createCustomToken(userData?.email, {
        role: userData?.role,
        patientId: userData?.patientId
      });

      res.json({ 
        token, 
        firebaseToken,
        user: { 
          email: userData?.email, 
          role: userData?.role, 
          name: userData?.name, 
          patientId: userData?.patientId 
        } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Verify Token
  app.get("/api/auth/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Also provide a fresh Firebase token
      const firebaseToken = await admin.auth().createCustomToken(decoded.email, {
        role: decoded.role,
        patientId: decoded.patientId
      });

      res.json({ user: decoded, firebaseToken });
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // --- Vite / Static Files ---
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
