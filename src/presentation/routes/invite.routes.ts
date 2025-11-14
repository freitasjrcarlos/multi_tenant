import { Router } from 'express';
import { InviteController } from '../controllers/InviteController';
import { AuthMiddleware } from '../../infrastructure/middleware/auth.middleware';
import { setRLSUserId } from '../../infrastructure/middleware/rls.middleware';
import { Role } from '../../domain/enums/Role';
import { validate } from '../middleware/validator.middleware';
import { inviteSchema } from '../validators/company.validator';

const router = Router();
const inviteController = new InviteController();
const authMiddleware = new AuthMiddleware();

/**
 * @swagger
 * /companies/{id}/invite:
 *   post:
 *     summary: Create an invite for a company
 *     tags: [Invite]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [OWNER, ADMIN, MEMBER]
 *                 default: MEMBER
 *     responses:
 *       201:
 *         description: Invite created successfully
 *       400:
 *         description: Validation error or invite already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post(
  '/:id/invite',
  authMiddleware.authenticate,
  setRLSUserId,
  authMiddleware.requireCompany,
  authMiddleware.requireRole([Role.OWNER, Role.ADMIN]),
  validate(inviteSchema),
  inviteController.create
);

export default router;

