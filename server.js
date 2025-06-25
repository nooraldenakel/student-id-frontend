import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Proxy only /student requests
app.use("/student", createProxyMiddleware({
    target: "https://student-id-info-back-production.up.railway.app",
    changeOrigin: true,
    onProxyReq: (proxyReq, req) => {
        const auth = req.headers['authorization'];
        if (auth) {
            proxyReq.setHeader('Authorization', auth);
        }
    }
}));

// ✅ Serve built frontend files
app.use(express.static(path.join(__dirname, "dist")));

// ✅ Fallback for SPA routing (/admin, /student-info, etc.)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
