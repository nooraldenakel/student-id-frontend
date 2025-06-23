import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Multer config (used for uploads)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ 1. PROXY BACKEND API ROUTES (only /api and /student)
app.use('/api', createProxyMiddleware({
    target: 'https://student-id-info-back-production.up.railway.app',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/api' // optional, but can force correct routing
    }
}));

app.use('/student', createProxyMiddleware({
    target: 'https://student-id-info-back-production.up.railway.app',
    changeOrigin: true,
    onProxyReq: (proxyReq, req) => {
        const auth = req.headers['authorization'];
        if (auth) {
            proxyReq.setHeader('Authorization', auth);
        }
    }
}));

app.use((req, res, next) => {
    console.log(`🔹 Incoming: ${req.method} ${req.url}`);
    next();
});

// ✅ 2. SERVE REACT FRONTEND (built in dist/)
app.use(express.static(path.join(__dirname, 'dist')));

// ✅ 3. FORWARD ALL OTHER ROUTES TO index.html (React handles /, /admin, etc.)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ✅ Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
