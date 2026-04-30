import { Router } from 'express';
import {
  searchUsersHandler,
  sendRequest,
  respondRequest,
  unfriendHandler,
  getFriendsHandler,
  getPendingRequestsHandler,
  getFriendsLeaderboardHandler,
} from '../controllers/friends.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { getSentRequestsHandler } from '../controllers/friends.controller';

const router = Router();
router.use(requireAuth);

router.get('/search', searchUsersHandler);
router.get('/', getFriendsHandler);
router.get('/requests/sent', getSentRequestsHandler); 
router.get('/requests', getPendingRequestsHandler);
router.get('/leaderboard', getFriendsLeaderboardHandler);
router.post('/request', sendRequest);
router.patch('/request/:requestId', respondRequest);
router.delete('/:friendId', unfriendHandler);

export default router;
