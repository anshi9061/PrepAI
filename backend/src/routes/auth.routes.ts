// TODO: Step 1.4 - Implement authentication routes
// TODO: Step 1.5 - Add proper middleware and validation

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

// TODO: Step 1.4 - POST /register
// router.post('/register', validate(registerSchema), authController.register);

// TODO: Step 1.4 - POST /login
// router.post('/login', validate(loginSchema), authController.login);

// TODO: Step 1.5 - POST /refresh
// router.post('/refresh', authController.refreshToken);

// TODO: Step 1.4 - POST /logout
// router.post('/logout', requireAuth, authController.logout);

export default router;