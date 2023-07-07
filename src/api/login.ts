import express from 'express';
import { login } from "../lib/auth";

const router = express.Router();

router.post<{}, any>('/', async (req, res) => {
    // Process a POST request
    const body = JSON.parse(req.body);
    console.log(body,  body.userName, body.password);
    if (body.userName === 'max@mail.de' && body.password === 'pw') {
      res.status(200)
      res.json({"token": "let-me-in!", userName: "max"});
    }
    res.status(403);
    res.json({});
});

export default router;
