// Router/userRouter.js
import express from 'express';
import { registerNew, loginUsers, logoutUser, getProfile } from '../Controller/userController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerNew);
router.post('/login', loginUsers);

// Protected routes
router.get('/me', auth, getProfile);
router.post('/logout', auth, logoutUser);

export default router;
