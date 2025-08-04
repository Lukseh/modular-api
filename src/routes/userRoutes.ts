import { Router } from 'express';
import { getUsers } from '../controllers/userController';
import { healthCheck } from '../functions/health';

const router = Router();

router.get('/users', getUsers);
router.get('/health', healthCheck);

export default router;