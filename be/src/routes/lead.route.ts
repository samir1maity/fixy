import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as leadController from '../controllers/lead.controller.js';

const leadRouter = Router({ mergeParams: true });

leadRouter.get('/', authenticate, leadController.getLeads);
leadRouter.patch('/:leadId/status', authenticate, leadController.updateLeadStatus);

export default leadRouter;
