import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/analyze.js';

dotenv.config();
const app = express();
const allowedOrigins = [
    'https://project-defence-coach.vercel.app',
    'http://localhost:5173',
    'http://localhost:3001',
    process.env.CLIENT_URL
].filter(Boolean); // Removes process.env.CLIENT_URL if it is undefined


app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy: origin not allowed'));
        }
    },
    credentials: true,
}));

app.use(express.json());

app.get('/api/ping', (req, res) => {
    return res.status(200).json({ status: 'ok' });
});

app.use("/api", apiRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT} `);
});
