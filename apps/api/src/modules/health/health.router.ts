import { Router } from 'express';
import { getHealth, getLive } from './health.controller';

const router = Router();

router.get('/', getHealth);
router.get('/live', getLive);

export { router as healthRouter };
