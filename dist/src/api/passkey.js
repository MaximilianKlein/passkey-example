"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../lib/auth");
const db_1 = require("../lib/db");
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    // Process a POST request
    const userName = await (0, auth_1.register)(req);
    const diff = 5; // 5min
    const expiry = new Date((new Date().getTime()) + diff * 60000);
    console.log({ desc: "registration succesful", db: JSON.stringify((0, db_1.db)()) });
    res.json({ userName, token: expiry.toISOString() });
});
exports.default = router;
//# sourceMappingURL=passkey.js.map