import express from 'express';
import { generateChallenge, signature } from "../lib/auth";

const router = express.Router();

router.get<{}, any>('/', async (req, res) => {
    res.status(200);
    const challenge = generateChallenge();
    res.json({challenge, signature: signature(challenge)});
});

export default router;
