import express from 'express';
import challenge from './challenge';
import passkey from './passkey';
import passkeylogin from './passkeylogin';

const router = express.Router();

router.use('/passkey', passkey);
router.use('/passkeylogin', passkeylogin);
router.use('/challenge', challenge);

export default router;
