"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const health_1 = require("../functions/health");
const router = (0, express_1.Router)();
router.get('/users', userController_1.getUsers);
router.get('/health', health_1.healthCheck);
exports.default = router;
