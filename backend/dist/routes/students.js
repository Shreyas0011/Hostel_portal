"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studentController_1 = require("../controllers/studentController");
const router = (0, express_1.Router)();
router.get('/', studentController_1.getStudents);
router.get('/:id', studentController_1.getStudentById);
exports.default = router;
