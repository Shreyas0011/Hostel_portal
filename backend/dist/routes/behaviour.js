"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const behaviourController_1 = require("../controllers/behaviourController");
const router = (0, express_1.Router)();
router.post('/', behaviourController_1.updateBehaviourLog);
exports.default = router;
