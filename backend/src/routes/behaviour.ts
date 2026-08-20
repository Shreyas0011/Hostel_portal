import { Router } from 'express';
import { updateBehaviourLog } from '../controllers/behaviourController';

const router = Router();

router.post('/', updateBehaviourLog);

export default router;
