"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const challenge_1 = __importDefault(require("./challenge"));
const passkey_1 = __importDefault(require("./passkey"));
const passkeylogin_1 = __importDefault(require("./passkeylogin"));
const router = express_1.default.Router();
router.use('/passkey', passkey_1.default);
router.use('/passkeylogin', passkeylogin_1.default);
router.use('/challenge', challenge_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map