import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import multer from 'multer';
import { fileURLToPath } from "url";
import { parseCSV } from './csvParser.js';
import { getStreamingServices } from './tmdb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.post("/upload", upload.single("watchlist"), async (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded.");
    const movies = await parseCSV(req.file.path);
    res.json(movies);
});

app.post("/streaming", async (req, res) => {
    const { titles, services } = req.body;
    const results = await getStreamingServices(titles, services);
    res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});