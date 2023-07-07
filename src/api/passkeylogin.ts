import express from 'express';
import { login } from "../lib/auth";

const router = express.Router();

router.post<{}, any>('/', async (req, res) => {
  // Process a POST request
  const userName = await login(req)
  const diff = 5; // 5min
  const expiry = new Date((new Date().getTime()) + diff*60000);

  res.json({userName, token: expiry.toISOString()});
});

export default router;
