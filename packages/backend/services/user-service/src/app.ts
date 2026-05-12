import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4009;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'UP', service: 'user-service' });
});

app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] user-service is running on port ${PORT}`);
});
