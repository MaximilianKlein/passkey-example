"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    // Process a POST request
    const body = JSON.parse(req.body);
    console.log(body, body.userName, body.password);
    if (body.userName === 'max@mail.de' && body.password === 'pw') {
        res.status(200);
        res.json({ "token": "let-me-in!", userName: "max" });
    }
    res.status(403);
    res.json({});
});
exports.default = router;
//# sourceMappingURL=login.js.map