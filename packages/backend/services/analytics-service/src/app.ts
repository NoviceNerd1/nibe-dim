import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4006;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'analytics-service' });
});

app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] analytics-service is running on port ${PORT}`);
});
