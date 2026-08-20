"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthController_1 = require("../controllers/healthController");
const router = (0, express_1.Router)();
router.post('/', healthController_1.saveHealthRecord);
router.delete('/:recordId', healthController_1.deleteHealthRecord);
router.get('/:studentId', healthController_1.getHealthRecords);
exports.default = router;
