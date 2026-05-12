/* eslint-disable no-console */
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4007;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'audit-service' });
});

app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] audit-service is running on port ${PORT}`);
});
