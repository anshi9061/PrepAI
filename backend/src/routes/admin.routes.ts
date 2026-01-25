// TODO: Step 2.1 - Implement admin routes for content management
// TODO: Step 2.3 - Add content review workflow routes
// TODO: Step 2.4 - Add AI generation routes

import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const adminController = new AdminController();

// TODO: Step 2.1 - Question management routes
// router.get('/questions', requireAdmin, adminController.getQuestions);
// router.post('/questions', requireAdmin, validate(questionSchema), adminController.createQuestion);
// router.put('/questions/:id', requireAdmin, adminController.updateQuestion);
// router.delete('/questions/:id', requireAdmin, adminController.deleteQuestion);

// TODO: Step 2.1 - Bulk operations
// router.post('/questions/bulk', requireAdmin, adminController.bulkImportQuestions);

// TODO: Step 2.4 - AI generation
// router.post('/questions/generate', requireAdmin, adminController.generateQuestionsWithAI);

// TODO: Step 2.3 - Content review
// router.post('/questions/:id/review', requireAdmin, adminController.reviewQuestion);

export default router;