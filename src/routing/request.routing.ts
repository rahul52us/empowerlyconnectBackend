import express from "express";
import authenticate from "../modules/config/authenticate";
import { createRequestService, getRequestByIdService, getRequestService } from "../services/request/request.service";
const router = express.Router();

router.get('/',getRequestService)
router.get('/:id',authenticate,getRequestByIdService)
router.post("/create", authenticate, createRequestService);

export default router;