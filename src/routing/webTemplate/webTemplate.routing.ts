import express from "express";
import authenticate from "../../modules/config/authenticate";
import { createWebTemplateService, getWebTemplateService } from "../../services/webTemplateService/webTemplateService";

const router = express.Router();

router.post("/create", authenticate, createWebTemplateService);
router.get('/:slug',getWebTemplateService)
export default router;