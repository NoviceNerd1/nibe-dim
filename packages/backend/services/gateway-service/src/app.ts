import express from 'express';
import cors from 'cors';
import { getSharedConfig } from 'shared';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  const sharedData = getSharedConfig();
  res.json({ status: 'UP', service: 'gateway-service', sharedInfo: sharedData.message });
});

app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] gateway is running on port ${PORT}`);
});
