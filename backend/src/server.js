import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import { connectDatabase } from './config/database.js';
import productRoutes from './routes/products.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 5000);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/products', productRoutes);

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI is required in environment variables');
}

connectDatabase(mongoUri).then(() => {
  app.listen(port, () => {
    console.log(`🚀 API running on port ${port}`);
  });
});
