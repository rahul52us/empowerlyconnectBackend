import express from "express";
import authenticate from "../../modules/config/authenticate";
import { createWebTemplateService } from "../../services/webTemplateService/webTemplateService";

const router = express.Router();

router.post("/create", authenticate, createWebTemplateService);

export default router;