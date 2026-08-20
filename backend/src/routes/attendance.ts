import { Router } from 'express';
import { logScan, getGateLogs } from '../controllers/attendanceController';

const router = Router();

router.post('/scan', logScan);
router.get('/logs/:studentId', getGateLogs);

export default router;
