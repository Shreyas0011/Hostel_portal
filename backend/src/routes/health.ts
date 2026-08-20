import { Router } from 'express';
import { saveHealthRecord, deleteHealthRecord, getHealthRecords } from '../controllers/healthController';

const router = Router();

router.post('/', saveHealthRecord);
router.delete('/:recordId', deleteHealthRecord);
router.get('/:studentId', getHealthRecords);

export default router;
