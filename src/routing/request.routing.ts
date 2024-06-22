import express from "express";
import authenticate from "../modules/config/authenticate";
import { createRequestService, getRequestByIdService, getRequestService, updateRequestService } from "../services/request/request.service";

const router = express.Router();

router.get('/',authenticate, getRequestService)
router.get('/:id',authenticate,getRequestByIdService)
router.post("/create", authenticate, createRequestService);
router.put('/:id',authenticate,updateRequestService)
export default router;