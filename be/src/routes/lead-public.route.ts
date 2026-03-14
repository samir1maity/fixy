import { Router } from 'express';
import { authenticateChat } from '../middlewares/auth.middleware.js';
import * as leadController from '../controllers/lead.controller.js';

const leadPublicRouter = Router();

leadPublicRouter.post('/', authenticateChat, leadController.submitLead);

export default leadPublicRouter;
