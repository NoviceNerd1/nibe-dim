/* eslint-disable no-console */
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4008;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'websocket-service' });
});

app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] websocket-service is running on port ${PORT}`);
});
