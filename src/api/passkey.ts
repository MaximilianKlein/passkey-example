import express from 'express';
import { register } from "../lib/auth";
import { db } from "../lib/db";

const router = express.Router();

router.post<{}, any>('/', async (req, res) => {
  // Process a POST request
  const userName = await register(req)
  const diff = 5; // 5min
  const expiry = new Date((new Date().getTime()) + diff*60000);

  console.log({desc: "registration succesful", db: JSON.stringify(db())});
  res.json({userName, token: expiry.toISOString()});
});

export default router;
