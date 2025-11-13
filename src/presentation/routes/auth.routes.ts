import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middleware/validator.middleware';
import { signUpSchema, acceptInviteSchema } from '../validators/auth.validator';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Create a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *                 minLength: 2
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post('/signup', validate(signUpSchema), authController.signUp);

/**
 * @swagger
 * /auth/accept-invite:
 *   post:
 *     summary: Accept an invite and create/associate user to company
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *               - name
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *                 minLength: 2
 *     responses:
 *       200:
 *         description: Invite accepted successfully
 *       400:
 *         description: Invalid token or validation error
 */
router.post('/accept-invite', validate(acceptInviteSchema), authController.acceptInvite);

export default router;

