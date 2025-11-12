import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

import connectDB from './mongodb/connect.js';
import postRoutes from './routes/postRoutes.js';
import dalleRoutes from './routes/dalleRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// API routes
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/dalle', dalleRoutes);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from DALL.E!' });
});

// Serve built client and SPA fallback
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// Catch-all for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

const startServer = async () => {
  try {
    connectDB(process.env.MONGODB_URL);
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (error) {
    console.error(error);
  }
};

startServer();