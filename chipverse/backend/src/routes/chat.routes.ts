import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import * as chatController from '../controllers/chat.controller';

const router = Router();

router.use(requireAuth);

router.get('/conversations', chatController.getConversations);
router.post('/dm', chatController.openDM);
router.post('/group', chatController.createGroup);
router.get('/conversations/:conversationId/messages', chatController.getMessages);
router.post('/conversations/:conversationId/members', chatController.addMember);

export default router;