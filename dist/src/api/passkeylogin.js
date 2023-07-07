"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../lib/auth");
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    // Process a POST request
    const userName = await (0, auth_1.login)(req);
    const diff = 5; // 5min
    const expiry = new Date((new Date().getTime()) + diff * 60000);
    res.json({ userName, token: expiry.toISOString() });
});
exports.default = router;
//# sourceMappingURL=passkeylogin.js.map