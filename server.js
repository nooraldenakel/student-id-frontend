import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 🧠 Backend proxy
const commonProxy = createProxyMiddleware({
    target: "https://student-id-info-back-production.up.railway.app",
    changeOrigin: true,
    selfHandleResponse: false,
    onProxyReq: (proxyReq, req, res) => {
        const auth = req.headers['authorization'];
        if (auth) {
            proxyReq.setHeader('Authorization', auth);
        }
    }
});

// ✅ Proxy only for backend API routes
app.use("/api", commonProxy);
app.use("/student", commonProxy);

// ✅ Serve frontend static files (your Vite build)
app.use(express.static(path.join(__dirname, "dist")));

// ✅ Fallback to index.html for all other frontend routes (SPA support)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
