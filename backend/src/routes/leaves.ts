import { Router } from 'express';
import { applyLeave, cancelLeave, approveLeave, rejectLeave, getLeaves } from '../controllers/leaveController';

const router = Router();

router.get('/', getLeaves);
router.post('/', applyLeave);
router.post('/:leaveId/cancel', cancelLeave);
router.post('/:leaveId/approve', approveLeave);
router.post('/:leaveId/reject', rejectLeave);

export default router;
