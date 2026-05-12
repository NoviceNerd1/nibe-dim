/* eslint-disable no-console */
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'workflow-service' });
});

app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] rule-engine-service is running on port ${PORT}`);
});
