import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Serve frontend static files
app.use(express.static(path.join(__dirname, "dist")));

// ✅ Proxy ONLY /api and /student calls
const proxy = createProxyMiddleware({
    target: "https://student-id-info-back-production.up.railway.app",
    changeOrigin: true,
    selfHandleResponse: false,
    onProxyReq: (proxyReq, req) => {
        const auth = req.headers['authorization'];
        if (auth) {
            proxyReq.setHeader('Authorization', auth);
        }
    }
});

app.use("/api", proxy);
app.use("/student", proxy);

// ✅ Handle SPA routes (important to go AFTER the proxy!)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
