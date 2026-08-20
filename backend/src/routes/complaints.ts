import { Router } from 'express';
import { getComplaints, createComplaint, resolveComplaint } from '../controllers/complaintController';

const router = Router();

router.get('/', getComplaints);
router.post('/', createComplaint);
router.post('/:complaintId/resolve', resolveComplaint);

export default router;
