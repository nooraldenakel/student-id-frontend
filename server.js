import express from "express";
//import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

//// Configure multer to store uploaded files in memory or on disk
const storage = multer.memoryStorage(); // or use diskStorage() to save to folder
const upload = multer({ storage });

//app.use(cors({
//    origin: "https://www.alayen-student-info.site",
//    credentials: true,
//    allowedHeaders: ["Authorization", "Content-Type"]
//}));

// Define Patch endpoint
//app.patch("/student/:examNumber", upload.single("image"), (req, res) => {

//    const authHeader = req.headers.authorization;
//    console.log("🔐 Authorization Header:", authHeader);

//    const examCode = req.params.examNumber;
//    const image = req.file;
//    const birthDate = req.body.birthDate;

//    console.log("🔄 Updating student:", examCode);
//    if (!students[examCode]) {
//        return res.status(404).json({ error: "Student not found" });
//    }

//    if (birthDate) students[examCode].birthDate = birthDate;
//    if (image) students[examCode].image = image.buffer; // or store on disk/cloud

//    return res.json({
//        message: `Student with ID: ${examCode} updated successfully`,
//        updated: students[examCode]
//    });

//    console.log("📥 Incoming POST to /student/:examCode");
//    console.log("🧪 Received Exam Code:", examCode);
//    console.log("🎂 Received Birth Date:", birthDate);
//    console.log("📦 req.body:", req.body);
//    console.log("📦 req.file:", req.file);
//    if (image) {
//        console.log("🖼️ Image Info:");
//        console.log(" - fieldname:", image.fieldname);
//        console.log(" - originalname:", image.originalname);
//        console.log(" - mimetype:", image.mimetype);
//        console.log(" - size (bytes):", image.size);
//    } else {
//        console.warn("❌ No image uploaded in 'image' field");
//    }

//    if (!authHeader || !image || !birthDate) {
//        return res.status(403).json({ error: "Missing data or unauthorized" });
//    }

//     //You can now process the image or store it in DB, etc.
//    res.json({ success: true, message: "Received", examCode, birthDate });
//});

// Serve frontend build
app.use(express.static(path.join(__dirname, "dist")));

const commonProxy = createProxyMiddleware({
    target: "https://student-id-info-back-production.up.railway.app",
    changeOrigin: true,
    selfHandleResponse: false,
    onProxyReq: (proxyReq, req, res) => {
        const auth = req.headers['authorization'];
        if (auth) {
            proxyReq.setHeader('Authorization', auth);
        };
    }
});

app.use("/", commonProxy);
app.use("/root", commonProxy)
app.use("/api", commonProxy);
app.use("/admin", commonProxy);
app.use("/student", commonProxy)


app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist/index.html"));
});

app.listen(PORT, () => {
    console.log(`✅ Frontend server running at http://localhost:${PORT}`);
});