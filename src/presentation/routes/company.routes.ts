import { Router } from 'express';
import { CompanyController } from '../controllers/CompanyController';
import { AuthMiddleware } from '../../infrastructure/middleware/auth.middleware';
import { setRLSUserId } from '../../infrastructure/middleware/rls.middleware';
import { validate } from '../middleware/validator.middleware';
import {
  createCompanySchema,
  listCompaniesSchema,
  selectCompanySchema,
  getCompanySchema,
} from '../validators/company.validator';

const router = Router();
const companyController = new CompanyController();
const authMiddleware = new AuthMiddleware();

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Create a new company
 *     tags: [Company]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *               logo:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Company created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authMiddleware.authenticate,
  setRLSUserId,
  validate(createCompanySchema),
  companyController.create
);

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: List companies for the authenticated user
 *     tags: [Company]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of companies
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authMiddleware.authenticate,
  setRLSUserId,
  validate(listCompaniesSchema),
  companyController.list
);

/**
 * @swagger
 * /companies/{id}/select:
 *   post:
 *     summary: Select active company for the user
 *     tags: [Company]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Company selected successfully
 *       400:
 *         description: User is not a member of this company
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:id/select',
  authMiddleware.authenticate,
  setRLSUserId,
  validate(selectCompanySchema),
  companyController.select
);

/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Get company by ID (with access validation)
 *     tags: [Company]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Company details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     logo:
 *                       type: string
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       403:
 *         description: User does not have access to this company
 *       404:
 *         description: Company not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/:id',
  authMiddleware.authenticate,
  setRLSUserId,
  validate(getCompanySchema),
  companyController.getById
);

export default router;

