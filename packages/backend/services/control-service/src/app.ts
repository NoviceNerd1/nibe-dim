/* eslint-disable no-console */
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4004;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'control-service' });
});

app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] control-service is running on port ${PORT}`);
});
