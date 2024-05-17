import express from "express";
import authenticate from "../modules/config/authenticate";
import { createRequestService, getRequestService } from "../services/request/request.service";
const router = express.Router();

router.get('/',authenticate,getRequestService)
router.post("/create", authenticate, createRequestService);

export default router;